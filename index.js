'use strict';


try{
	require('dotenv').config();
	require('colors');

	const server = require('./server');

	server.create();
	server.start();
}
catch (e){
	console.log(e);
}
