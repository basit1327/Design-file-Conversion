const crypto = require('crypto'),
    fs = require('fs'),
    promisify = require('util.promisify'),
    readFile = promisify(fs.readFile),
    config = require('config'),
    debug = require('debug')(process.env.DEBUG_NAMESPACE)

getFileExtension = (originalName) => {
    return originalName.split('.').pop().toLowerCase()
}

/**
 * @description This function create hash of file
 * @param localFilePath
 * @returns {Promise<string|Error>}
 */
getFileHash = async (fileName) => {
    try{
        const fileBuffer = await readFile(fileName);
        const hashSum = crypto.createHash('sha256');
        hashSum.update(fileBuffer);
        const hex = hashSum.digest('hex');
        return hex;
    }
    catch (e){
        return new Error('Something went wrong while creating file hash')
    }
}

readGeoJSONFile = (filePath) => {
    return new Promise((resolve, reject) => {
        fs.readFile(filePath, 'utf8' , (err, data) => {
            if (err) {
                debug(err)
                reject(new Error('Failed to read geojson file, No such a file'));
            }
            else {
                let jsonData = JSON.parse(data);
                resolve(jsonData);
            }
        })
    })
}

getSRIDsList = async () => {
    try {
        const fileBuffer = await readFile(`${config.get('publicDir')}/assets/json/srid.json`);
        let data = JSON.parse(fileBuffer.toString());
        return data;
    }
    catch (e){
        debug(e);
    }
};

getSRIDsList()

module.exports = {
    getFileExtension,
    getFileHash,
    readGeoJSONFile
};

