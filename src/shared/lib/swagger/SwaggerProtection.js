/**
 * Swagger Protection Middleware
 * Provides authentication for Swagger UI in production/staging environments
 */
class SwaggerProtection {
    constructor(config) {
        this.config = config;
        this.logger = this.createLogger();
    }

    createLogger() {
        return {
            warn: (msg) => console.warn(`[Swagger Protection] ⚠️  ${msg}`),
            error: (msg) => console.error(`[Swagger Protection] ❌ ${msg}`),
        };
    }

    /**
     * Basic Authentication Middleware
     */
    basicAuth() {
        return (req, res, next) => {
            if (!this.config.protectionEnabled) {
                return next();
            }

            const authHeader = req.headers.authorization;

            if (!authHeader || !authHeader.startsWith('Basic ')) {
                return this.requestAuth(res);
            }

            try {
                const base64Credentials = authHeader.split(' ')[1];
                const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
                const [username, password] = credentials.split(':');

                if (username === this.config.username && password === this.config.password) {
                    return next();
                }

                this.logger.warn(`Failed authentication attempt from ${req.ip}`);
                return this.requestAuth(res);
            } catch (error) {
                this.logger.error(`Auth error: ${error.message}`);
                return this.requestAuth(res);
            }
        };
    }

    /**
     * Request authentication from client
     */
    requestAuth(res) {
        res.setHeader('WWW-Authenticate', 'Basic realm="Swagger Documentation"');
        res.status(401).json({
            error: 'Authentication required',
            message: 'Please provide valid credentials to access the API documentation'
        });
    }

    /**
     * IP Whitelist Middleware (optional enhancement)
     */
    ipWhitelist(allowedIps = []) {
        return (req, res, next) => {
            if (!this.config.protectionEnabled || allowedIps.length === 0) {
                return next();
            }

            const clientIp = req.ip || req.connection.remoteAddress;

            if (allowedIps.includes(clientIp)) {
                return next();
            }

            this.logger.warn(`Blocked access from unauthorized IP: ${clientIp}`);
            res.status(403).json({
                error: 'Access Forbidden',
                message: 'Your IP address is not authorized to access this resource'
            });
        };
    }

    /**
     * Environment-based access control
     */
    environmentCheck() {
        return (req, res, next) => {
            const env = process.env.NODE_ENV;

            // Allow in development without restrictions
            if (env === 'development') {
                return next();
            }

            // Check if Swagger is disabled
            if (!this.config.enabled) {
                return res.status(404).json({
                    error: 'Not Found',
                    message: 'API documentation is not available in this environment'
                });
            }

            next();
        };
    }
}

module.exports = SwaggerProtection;