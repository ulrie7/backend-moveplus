const path = require('path');

/**
 * Centralized Swagger Configuration
 * Manages all Swagger-related settings with environment variable support
 */
class SwaggerConfig {
    constructor() {
        // Swagger UI Protection
        this.enabled = process.env.SWAGGER_ENABLED !== 'false';
        this.protectionEnabled = process.env.SWAGGER_PROTECTION_ENABLED === 'true';
        this.username = process.env.SWAGGER_USERNAME || 'admin';
        this.password = process.env.SWAGGER_PASSWORD || 'admin123';

        // console.log("ud", this.enabled)
        // console.log("password", this.password)

        // Multiple module paths support
        this.modulePaths = [
            path.resolve(__dirname, '../../../modules'),
            path.resolve(__dirname, '../../../shared/modules')
        ];

        // Spec paths
        this.privateSpecsPath = path.resolve(__dirname, '../../../swagger/specs/private');

        // API Documentation
        this.title = 'API Documentation';
        this.version = '1.0.0';
        this.description = 'API for managing resources';

        // Servers configuration
        this.servers = this.buildServers();

        // Security schemes
        this.securitySchemes = this.buildSecuritySchemes();

        // Tags
        this.tags = [];

        // External docs
        this.externalDocs = null;

        // Contact & License
        this.contact = null;
        this.license = null;

        // Performance
        this.enableCaching = process.env.SWAGGER_CACHE_ENABLED !== 'false';
        this.cacheTimeout = parseInt(process.env.SWAGGER_CACHE_TIMEOUT || '3600000'); // 1 hour default
    }

    buildServers() {
        const servers = [];

        if (process.env.BASE_URL) {
            servers.push({
                url: process.env.BASE_URL,
                description: 'Current Environment'
            });
        }

        if (process.env.NODE_ENV === 'development') {
            servers.push({
                url: process.env.DEV_API_URL || 'http://localhost:3000',
                description: 'Development Server'
            });
        }

        if (process.env.STAGING_API_URL) {
            servers.push({
                url: process.env.STAGING_API_URL,
                description: 'Staging Server'
            });
        }

        if (process.env.PROD_API_URL) {
            servers.push({
                url: process.env.PROD_API_URL,
                description: 'Production Server'
            });
        }

        return servers.length > 0 ? servers : undefined;
    }

    buildSecuritySchemes() {
        const securitySchemes = {
            bearerAuth: {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT',
                description: 'JWT Authorization header using the Bearer scheme'
            },
            apiKeyAuth: {
                type: 'apiKey',
                in: 'header',
                name: 'X-API-KEY',
                description: 'API Key for authentication'
            },
            basicAuth: {
                type: 'http',
                scheme: 'basic',
                description: 'Basic HTTP authentication'
            }
        };

        // Get enabled schemes from environment variable
        const enabledSchemes = process.env.SWAGGER_AUTH_TYPES || 'bearerAuth';

        // Filter schemes based on environment configuration
        const enabledSchemesList = enabledSchemes.split(',').map(s => s.trim());

        return Object.keys(securitySchemes).reduce((result, schemeName) => {
            if (enabledSchemesList.includes(schemeName)) {
                result[schemeName] = securitySchemes[schemeName];
            }
            return result;
        }, {});
    }

    /**
     * Add custom module path
     */
    addModulePath(customPath) {
        const resolvedPath = path.resolve(customPath);
        if (!this.modulePaths.includes(resolvedPath)) {
            this.modulePaths.push(resolvedPath);
        }
        return this;
    }

    /**
     * Set contact information
     */
    setContact(name, url, email) {
        this.contact = { name, url, email };
        return this;
    }

    /**
     * Set license information
     */
    setLicense(name, url) {
        this.license = { name, url };
        return this;
    }

    /**
     * Set external documentation
     */
    setExternalDocs(description, url) {
        this.externalDocs = { description, url };
        return this;
    }

    /**
     * Add global tags
     */
    addTag(name, description, externalDocs = null) {
        this.tags.push({ name, description, externalDocs });
        return this;
    }

    /**
     * Validate configuration
     */
    validate() {
        const errors = [];

        if (this.protectionEnabled) {
            if (!this.username || this.username.length < 3) {
                errors.push('SWAGGER_USERNAME must be at least 3 characters when protection is enabled');
            }
            if (!this.password || this.password.length < 6) {
                errors.push('SWAGGER_PASSWORD must be at least 6 characters when protection is enabled');
            }
        }

        if (!this.title || !this.version) {
            errors.push('Title and version are required');
        }

        return {
            valid: errors.length === 0,
            errors
        };
    }
}

module.exports = SwaggerConfig;