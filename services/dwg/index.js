'use strict';

const multer = require('multer'),
	config = require('config'),
	debug = require('debug')(process.env.DEBUG_NAMESPACE),
	fs = require('fs'),
	fileUtilFunctions = require('../../utils/file_util_functions'),
	cliExecution = require('../../utils/cli_execution'),
	storageDirForDxf = config.get('storageDirForDxf'),
	storageDirGeoJSON = config.get('storageDirForDwg'),
	uniqid = require('uniqid'),
	Joi = require('joi'),
	{ StatusCodes } = require('http-status-codes');


const fileStorage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, storageDirForDxf)
	},
	filename: function (req, file, cb) {
		let name = `${uniqid()}.dxf`
		req.savedFileName = name;
		cb(null, name);
	}
});

const uploadFileSetting = multer({
	storage: fileStorage,
	fileFilter: (req, file, callback) => {
		try{
			const fileSize = parseInt(req.headers['content-length']);
			let extension = fileUtilFunctions.getFileExtension(file.originalname);
			if(fileSize > process.env.DXF_UPLOAD_LIMIT){
				callback(`Max file limit is ${process.env.DXF_UPLOAD_LIMIT / (1000*1000)} Mb`,null);
			}
			else if (!file || extension!== 'dwg') {
				callback('Please upload a dwg file.',null);
			} else {
				callback(null, true)
			}
		}
		catch (e){
			callback('Something went wrong in file uploading step',null)
		}
	}
}).single('designFile');

async function convertDwgToDxf(req, res) {
	res.send("OK from pl-dwg-conv");
	return;

	uploadFileSetting(req, res, async (err)=> {
		if (err) {
			res.status(StatusCodes.BAD_REQUEST).send({message:err})
		}
		else {
			try {
				if (!req.savedFileName){
					res.status(StatusCodes.BAD_REQUEST).send({message:'No file attached, Please add a .dxf file'})
				}
				else {
					let fileNameWithoutExtension = req.savedFileName.replace('.dxf','')
					let geoJSONFileName = fileNameWithoutExtension +'.geojson';

					let fileHash = await fileUtilFunctions.getFileHash(`${storageDirForDxf + req.savedFileName}`);
					if(fileHash instanceof Error){
						throw fileHash
					}

					let existAtCloud = await checkIsExistOnCloud(`${fileHash}.geojson`);
					if(!existAtCloud){
						/*===========================================================*/
						/* If file not exist at cloud then create geojson by ogr2ogr */
						//region File conversion
						let ogr2ogrCommand = `ogr2ogr 
							-f GeoJSON
							-s_srs epsg:2157 
							-t_srs epsg:4326 
							${storageDirGeoJSON + geoJSONFileName} 
							${storageDirForDxf + req.savedFileName}`;

						let cliResult = await cliExecution.executeCLI(ogr2ogrCommand.replace(/\n/g, " "), 'dxfToGeoJSON');
						if(cliResult instanceof Error){
							throw cliResult;
						}
						//endregion
					}

					//region Reading GeoJSON Data and returning layers Array
					let geoJSONData;
					if(!existAtCloud){
						/*=================================================*/
						/*  If file not exist at cloud then ogr2ogr create geojson
							and store in local file system read it from there
						 */
						geoJSONData = await fileUtilFunctions.readGeoJSONFile(`${storageDirGeoJSON + geoJSONFileName}`)
					}
					else {
						geoJSONData = JSON.parse(existAtCloud);
					}

					let layers = extractLayersFromGeoJSON(geoJSONData);
					//endregion

					//region Uploading geojson file to cloud (S3) and deleting locally stored files
					await uploadGeoJSONFileToCloud(
						existAtCloud,
						existAtCloud ? null :`${storageDirGeoJSON + geoJSONFileName}`,
							`${storageDirForDxf + req.savedFileName}`,
						fileHash
					)
					//endregion

					res.status(StatusCodes.OK)
						.send({
							message: 'DXF to GeoJSON conversion succeed',
							data: {
								fileName: `${fileHash}.geojson`,
								layers
							}
						});
				}
			}
			catch (e) {
				res.status(StatusCodes.BAD_REQUEST)
					.send({
						message: e.hasOwnProperty('message') ? e.message : 'Something went wrong',
					});
				debug(e);
			}
		}
	});
}


module.exports = {
	convertDwgToDxf,
};
