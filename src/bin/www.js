#!/usr/bin/env node

/**
 * Module dependencies.
 */

const app = require('../app')
const debug = require('debug')(
    'try-modyle-architecture:server'
)
const http = require('http')

/**
 * Get port from environment and store in Express.
 */

const port = normalizePort(process.env.PORT || '3000')
app.set('port', port)

/**
 * Create HTTP server.
 */

const server = http.createServer(app)



/**
 * Listen on provided port, on all network interfaces.
 */

server.listen(port, () => {
    console.log(
        `We are live on ${process.env.NODE_ENV} mode on port ${port}`.yellow.bold
    )
    logEnvironmentSettings()
})

server.on('error', onError)
server.on('listening', onListening)

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
    console.log(`Error: ${err.message}`.red)
        // Close server & exit process
    server.close(() => process.exit(1))
})


/**
 * Helper function to display environment settings
 */

function logEnvironmentSettings() {
    const settings = {
        'Environment': process.env.NODE_ENV || 'development',
        'MongoDB Replica Set': process.env.MONGO_USE_REPLICA_SET === 'true' ? 'Enabled' : 'Disabled',
        'Email Error Suppression': process.env.EMAIL_SUPPRESS_ERRORS === 'true' ? 'Errors Suppressed' : 'Errors Thrown'
    };

    console.log('\n=== Server Configuration ==='.cyan.bold);
    Object.keys(settings).forEach(key => {
        console.log(`${key}: ${settings[key]}`.yellow);
    });
    console.log('============================\n'.cyan.bold);
};



/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
    const port = parseInt(val, 10)

    if (isNaN(port)) {
        // named pipe
        return val
    }

    if (port >= 0) {
        // port number
        return port
    }

    return false
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
    if (error.syscall !== 'listen') {
        throw error
    }

    const bind = typeof port === 'string' ? 'Pipe ' + port : 'Port ' + port

    // handle specific listen errors with friendly messages
    switch (error.code) {
        case 'EACCES':
            console.error(bind + ' requires elevated privileges')
            process.exit(1)
            break
        case 'EADDRINUSE':
            console.error(bind + ' is already in use')
            process.exit(1)
            break
        default:
            throw error
    }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
    const addr = server.address()
    const bind = typeof addr === 'string' ? 'pipe ' + addr : 'port ' + addr.port
    debug('Listening on ' + bind)
}