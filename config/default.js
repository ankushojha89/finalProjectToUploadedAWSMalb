var config = require('./config.json');

const winston = require('winston');
const express = require('express');

/**************************************************************/
/** * logger setup */
/**************************************************************/
var logger = new (winston.Logger)({
    transports: [
      new (winston.transports.Console)()
     //, new (winston.transports.File)({ filename: config.server.logfilename })
    ]
  });

process.env.NODE_ENV = process.env.NODE_ENV || 'development';
logger.info('Current server running environment %s', process.env.NODE_ENV);


module.exports={config,logger,express};