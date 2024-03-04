const winston = require('winston');
require('winston-mongodb');
require('dotenv').config();

// Retrieve MongoDB URI from environment variable
const { ATLAS_URI } = process.env;

// Create Winston logger instance
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.MongoDB({ db: ATLAS_URI, collection: 'logs',options:{useUnifiedTopology: true }})
  ]
});

// Define log functions with different levels
const logService = {
  error: (message) => {
    console.error(message);
    logger.error(message);
  },
  warn: (message) => {
    logger.warn(message);
  },
  info: (message) => {
    logger.info(message);
  },
  debug: (message) => {
    logger.debug(message);
  }
};

module.exports = logService;
