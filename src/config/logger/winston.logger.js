const winston = require('winston');
const path = require('path');

const logDirectory = path.join(__dirname, '../../../logs');

// Configuration de winston
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),
    transports: [
        new winston.transports.File({ filename: path.join(logDirectory, 'info.log'), level: 'info' }),
        new winston.transports.File({ filename: path.join(logDirectory, 'warn.log'), level: 'warn' }),
        new winston.transports.File({ filename: path.join(logDirectory, 'error.log'), level: 'error' }),
        new winston.transports.File({ filename: path.join(logDirectory, 'http.log'), level: 'http' }),
        new winston.transports.File({ filename: path.join(logDirectory, 'verbose.log'), level: 'verbose' }),
        new winston.transports.File({ filename: path.join(logDirectory, 'debug.log'), level: 'debug' }),
        new winston.transports.File({ filename: path.join(logDirectory, 'silly.log'), level: 'silly' }),
        new winston.transports.File({ filename: path.join(logDirectory, 'combined.log') })
    ]
});

// En production, loggez aussi sur la console
if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
        format: winston.format.simple()
    }));
}

module.exports = logger;