'use strict';
const
    express = require('express'),
    bodyParser = require('body-parser'),
    routes = require('./routes'),
    config = require('config');

let server = express(),
    create,
    start
    ;

create = function () {
    // Returns middleware that parses json
    server.use(bodyParser.json());

    // setup public directory
    server.use(express.static('public'));

    // Set up routes
    routes.init(server);
};

start = function () {
    server.listen(config.get('serverPort'), function () {
        console.log(`Planloader GIS Service is Live ${config.get('hostName')} environment on Port: ${config.get('serverPort')}`);
    });
};



module.exports ={
    create,
    start
};
