const swaggerJsdoc = require('swagger-jsdoc');
const fs = require('fs');
const path = require('path');
const SwaggerConfig = require('./SwaggerConfig');

/**
 * Professional Swagger Loader
 * Handles loading of schemas and specs from multiple module directories
 * with caching, error handling, and performance optimization
 */
class SwaggerLoader {
    constructor(config = null) {
        this.config = config || new SwaggerConfig();
        this.schemas = {};
        this.specFiles = [];
        this.paths = {};
        this.cache = null;
        this.cacheTimestamp = null;
        this.logger = this.createLogger();
    }

    /**
     * Create simple logger
     */
    createLogger() {
        const isProduction = process.env.NODE_ENV === 'production';
        return {
            info: (msg) => !isProduction && console.log(`[Swagger] ℹ️  ${msg}`),
            warn: (msg) => console.warn(`[Swagger] ⚠️  ${msg}`),
            error: (msg) => console.error(`[Swagger] ❌ ${msg}`),
            success: (msg) => !isProduction && console.log(`[Swagger] ✅ ${msg}`)
        };
    }

    /**
     * Set configuration properties
     */
    setTitle(title) {
        this.config.title = title;
        return this;
    }

    setDescription(description) {
        this.config.description = description;
        return this;
    }

    setVersion(version) {
        this.config.version = version;
        return this;
    }

    /**
     * Load schemas from all configured module paths
     */
    loadSchemas() {
        this.logger.info('Loading schemas...');
        let schemasLoaded = 0;

        for (const modulesPath of this.config.modulePaths) {
            if (!fs.existsSync(modulesPath)) {
                this.logger.warn(`Module path does not exist: ${modulesPath}`);
                continue;
            }

            try {
                const modules = fs.readdirSync(modulesPath);

                for (const module of modules) {
                    const schemaDir = path.join(modulesPath, module, 'swagger/schema/');

                    if (!fs.existsSync(schemaDir)) {
                        continue;
                    }

                    try {
                        const schemaFiles = fs.readdirSync(schemaDir);

                        for (const schemaFile of schemaFiles) {
                            if (!schemaFile.endsWith('.js') && !schemaFile.endsWith('.json')) {
                                continue;
                            }

                            try {
                                const schemaPath = path.join(schemaDir, schemaFile);
                                const moduleSchemas = require(schemaPath);

                                // Check for schema conflicts
                                const conflictingKeys = Object.keys(moduleSchemas).filter(
                                    key => this.schemas[key]
                                );

                                if (conflictingKeys.length > 0) {
                                    this.logger.warn(
                                        `Schema conflict in ${module}/${schemaFile}: ${conflictingKeys.join(', ')} already exist`
                                    );
                                }

                                this.schemas = {...this.schemas, ...moduleSchemas };
                                schemasLoaded++;
                            } catch (error) {
                                this.logger.error(`Failed to load schema ${schemaFile} from ${module}: ${error.message}`);
                            }
                        }
                    } catch (error) {
                        this.logger.error(`Failed to read schema directory for ${module}: ${error.message}`);
                    }
                }
            } catch (error) {
                this.logger.error(`Failed to read modules from ${modulesPath}: ${error.message}`);
            }
        }

        this.logger.success(`Loaded ${schemasLoaded} schema file(s) with ${Object.keys(this.schemas).length} schema(s)`);
        return this;
    }

    /**
     * Load spec files from all configured paths
     */
    loadSpecFiles() {
        this.logger.info('Loading spec files...');
        let specsLoaded = 0;

        // Load from module paths
        for (const modulesPath of this.config.modulePaths) {
            if (!fs.existsSync(modulesPath)) {
                continue;
            }

            try {
                const modules = fs.readdirSync(modulesPath);

                for (const module of modules) {
                    const specDir = path.join(modulesPath, module, 'swagger/_spec/');

                    if (!fs.existsSync(specDir)) {
                        continue;
                    }

                    try {
                        const specFiles = fs.readdirSync(specDir);

                        for (const specFile of specFiles) {
                            if (!specFile.endsWith('.js') && !specFile.endsWith('.json')) {
                                continue;
                            }

                            const specPath = path.join(specDir, specFile);
                            this.specFiles.push(specPath);
                            specsLoaded++;
                        }
                    } catch (error) {
                        this.logger.error(`Failed to read spec directory for ${module}: ${error.message}`);
                    }
                }
            } catch (error) {
                this.logger.error(`Failed to read modules from ${modulesPath}: ${error.message}`);
            }
        }

        // Load private spec files
        if (fs.existsSync(this.config.privateSpecsPath)) {
            try {
                const files = fs.readdirSync(this.config.privateSpecsPath);

                for (const file of files) {
                    if (!file.endsWith('.js') && !file.endsWith('.json')) {
                        continue;
                    }

                    const specPath = path.join(this.config.privateSpecsPath, file);
                    this.specFiles.push(specPath);
                    specsLoaded++;
                }
            } catch (error) {
                this.logger.error(`Failed to read private specs: ${error.message}`);
            }
        }

        this.logger.success(`Loaded ${specsLoaded} spec file(s)`);
        return this;
    }

    /**
     * Merge all spec files into paths object
     */
    mergeSpecs() {
        this.logger.info('Merging specs...');
        let pathsCount = 0;

        for (const specFile of this.specFiles) {
            try {
                // Clear require cache for development
                if (process.env.NODE_ENV === 'development') {
                    delete require.cache[require.resolve(specFile)];
                }

                const pathSpec = require(specFile);
                const newPaths = Object.keys(pathSpec);

                // Check for path conflicts
                const conflictingPaths = newPaths.filter(path => this.paths[path]);
                if (conflictingPaths.length > 0) {
                    this.logger.warn(`Path conflict in ${specFile}: ${conflictingPaths.join(', ')} already exist`);
                }

                this.paths = {...this.paths, ...pathSpec };
                pathsCount += newPaths.length;
            } catch (error) {
                this.logger.error(`Failed to load spec file ${specFile}: ${error.message}`);
            }
        }

        this.logger.success(`Merged ${pathsCount} path(s)`);
        return this;
    }

    /**
     * Build Swagger options with enhanced configuration
     */
    buildSwaggerOptions() {
        const info = {
            title: this.config.title,
            version: this.config.version,
            description: this.config.description,
        };

        if (this.config.contact) {
            info.contact = this.config.contact;
        }

        if (this.config.license) {
            info.license = this.config.license;
        }

        const definition = {
            openapi: '3.0.0',
            info,
            components: {
                securitySchemes: this.config.securitySchemes,
                schemas: this.schemas,
            },
            security: [{ bearerAuth: [] }],
            paths: this.paths,
        };

        if (this.config.servers && this.config.servers.length > 0) {
            definition.servers = this.config.servers;
        }

        if (this.config.tags && this.config.tags.length > 0) {
            definition.tags = this.config.tags;
        }

        if (this.config.externalDocs) {
            definition.externalDocs = this.config.externalDocs;
        }

        return {
            definition,
            apis: this.buildApiPaths(),
        };
    }

    /**
     * Build API paths from all module directories
     */
    buildApiPaths() {
        const apiPaths = [];

        for (const modulesPath of this.config.modulePaths) {
            if (fs.existsSync(modulesPath)) {
                apiPaths.push(path.join(modulesPath, '**/routes/*.js'));
            }
        }

        return apiPaths;
    }

    /**
     * Generate Swagger documentation with caching support
     */
    generateSwaggerDocs() {
        // Return cached version if available and valid
        if (this.config.enableCaching && this.cache && this.isCacheValid()) {
            this.logger.info('Using cached Swagger documentation');
            return this.cache;
        }

        this.logger.info('Generating Swagger documentation...');

        try {
            const swaggerDocs = swaggerJsdoc(this.buildSwaggerOptions());

            // Cache the result
            if (this.config.enableCaching) {
                this.cache = swaggerDocs;
                this.cacheTimestamp = Date.now();
            }

            this.logger.success('Swagger documentation generated successfully');
            return swaggerDocs;
        } catch (error) {
            this.logger.error(`Failed to generate Swagger docs: ${error.message}`);
            throw error;
        }
    }

    /**
     * Check if cache is still valid
     */
    isCacheValid() {
        if (!this.cacheTimestamp) {
            return false;
        }

        const now = Date.now();
        const elapsed = now - this.cacheTimestamp;

        return elapsed < this.config.cacheTimeout;
    }

    /**
     * Clear cache
     */
    clearCache() {
        this.cache = null;
        this.cacheTimestamp = null;
        this.logger.info('Cache cleared');
        return this;
    }

    /**
     * Load and generate all in one call
     */
    initialize() {
        this.loadSchemas();
        this.loadSpecFiles();
        this.mergeSpecs();
        return this;
    }

    /**
     * Get statistics about loaded resources
     */
    getStats() {
        return {
            schemas: Object.keys(this.schemas).length,
            specFiles: this.specFiles.length,
            paths: Object.keys(this.paths).length,
            modulePaths: this.config.modulePaths,
            cached: !!this.cache,
        };
    }
}

module.exports = SwaggerLoader;