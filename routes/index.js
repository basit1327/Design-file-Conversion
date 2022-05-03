'use strict';

const dwgController = require('../controllers/dwg')

function init(server) {

    server.use('/', function (req, res, next) {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', "*");
        next();
    });

    server.get('/', function (req, res) {
        res.send('Planloader DWG Conversion Service In NodeJS')
    });


    server.use('/dwg',dwgController);

}

module.exports = {
    init: init
};
