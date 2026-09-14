const fs = require('fs');
const path = require('path');

/**
 * Professional Swagger Route Builder
 * Fluent API for building Swagger route specifications
 * Now supports both src/modules and src/shared/modules
 */
class SwaggerRouteBuilder {
    constructor(groupDescription = '', tags = []) {
        this.groupDescription = groupDescription;
        this.tags = tags;
        this.routes = {};
        this.currentPath = null;
        this.currentHttpMethod = null;
        this.currentRoute = null;
        this.logger = this.createLogger();
    }

    createLogger() {
        const isDev = process.env.NODE_ENV === 'development';
        return {
            info: (msg) => isDev && console.log(`[SwaggerBuilder] ${msg}`),
            error: (msg) => console.error(`[SwaggerBuilder] ❌ ${msg}`),
        };
    }

    /**
     * Add a new route
     */
    addRoute(basePath, httpMethod, summary, tags = []) {
        this.currentPath = basePath;
        this.currentHttpMethod = httpMethod.toLowerCase();

        const route = {
            summary,
            tags: tags.length > 0 ? tags : this.tags,
            parameters: [],
            requestBody: null,
            responses: {},
            description: '',
        };

        if (!this.routes[basePath]) {
            this.routes[basePath] = {};
        }

        this.routes[basePath][this.currentHttpMethod] = route;
        this.currentRoute = this.routes[basePath][this.currentHttpMethod];

        return this;
    }

    /**
     * Add description to current route
     */
    addDescription(description) {
        this.validateCurrentRoute();
        this.currentRoute.description = description;
        return this;
    }

    /**
     * Add operation ID to current route
     */
    addOperationId(operationId) {
        this.validateCurrentRoute();
        this.currentRoute.operationId = operationId;
        return this;
    }

    /**
     * Mark route as deprecated
     */
    setDeprecated(deprecated = true) {
        this.validateCurrentRoute();
        this.currentRoute.deprecated = deprecated;
        return this;
    }

    /**
     * Add path parameter
     */
    addPathParam(name, type, description, required = true, options = {}) {
        this.validateCurrentRoute();

        const param = { in: 'path',
            name,
            schema: { type },
            description,
            required,
        };

        if (options.example) {
            param.example = options.example;
        }

        if (options.enum) {
            param.schema.enum = options.enum;
        }

        this.currentRoute.parameters.push(param);
        return this;
    }

    /**
     * Add query parameter
     */
    addQueryParam(name, type, description, required = false, options = {}) {
        this.validateCurrentRoute();

        const param = { in: 'query',
            name,
            schema: { type },
            description,
            required,
        };

        if (options.example) {
            param.example = options.example;
        }

        if (options.default) {
            param.schema.default = options.default;
        }

        if (options.enum) {
            param.schema.enum = options.enum;
        }

        if (options.minimum !== undefined) {
            param.schema.minimum = options.minimum;
        }

        if (options.maximum !== undefined) {
            param.schema.maximum = options.maximum;
        }

        this.currentRoute.parameters.push(param);
        return this;
    }

    /**
     * Add header parameter
     */
    addHeaderParam(name, type, description, required = false, options = {}) {
        this.validateCurrentRoute();

        const param = { in: 'header',
            name,
            schema: { type },
            description,
            required,
        };

        if (options.example) {
            param.example = options.example;
        }

        this.currentRoute.parameters.push(param);
        return this;
    }

    /**
     * Add request body with schema reference
     */
    addRequestBody(schemaRef, description = 'Request body', required = true, examples = null) {
        this.validateCurrentRoute();

        const currentRequestBody = this.currentRoute.requestBody;

        if (currentRequestBody && currentRequestBody.content['multipart/form-data']) {
            this.addSchemaToMultipart(schemaRef);
        } else {
            const content = {
                'application/json': {
                    schema: { $ref: schemaRef },
                },
            };

            if (examples) {
                content['application/json'].examples = examples;
            }

            this.currentRoute.requestBody = {
                description,
                required,
                content,
            };
        }

        return this;
    }

    /**
     * Add body parameter with inline schema (no reference)
     * Supports both simple schemas and complex nested objects
     */
    addBodyParam(schema, description = 'Request body', required = true, examples = null) {
        this.validateCurrentRoute();

        const currentRequestBody = this.currentRoute.requestBody;

        if (currentRequestBody && currentRequestBody.content['multipart/form-data']) {
            this.logger.error('Cannot add JSON body to multipart form-data. Use addFormField instead.');
            return this;
        }

        const content = {
            'application/json': {
                schema: this.normalizeSchema(schema),
            },
        };

        if (examples) {
            content['application/json'].examples = examples;
        }

        this.currentRoute.requestBody = {
            description,
            required,
            content,
        };

        return this;
    }

    /**
     * Normalize schema - handles both inline objects and schema references
     */
    normalizeSchema(schema) {
        if (!schema) {
            return { type: 'object' };
        }

        // If it's already a proper schema with type
        if (schema.type) {
            return schema;
        }

        // If it's a reference
        if (schema.$ref) {
            return schema;
        }

        // If it's a plain object, assume it's properties definition
        if (typeof schema === 'object' && schema.properties) {
            return schema;
        }

        // Default to treating it as a schema object
        return schema;
    }

    /**
     * Add array body parameter
     */
    addArrayBody(itemSchema, description = 'Array of items', required = true, options = {}) {
        this.validateCurrentRoute();

        const schema = {
            type: 'array',
            items: this.normalizeSchema(itemSchema),
        };

        if (options.minItems !== undefined) {
            schema.minItems = options.minItems;
        }

        if (options.maxItems !== undefined) {
            schema.maxItems = options.maxItems;
        }

        if (options.uniqueItems !== undefined) {
            schema.uniqueItems = options.uniqueItems;
        }

        return this.addBodyParam(schema, description, required);
    }

    /**
     * Add file upload field
     */
    addFileUpload(fieldName, description = 'File upload', required = false, options = {}) {
        this.validateCurrentRoute();

        const currentRequestBody = this.currentRoute.requestBody;

        if (currentRequestBody && currentRequestBody.content['application/json']) {
            this.convertToMultipart();
        }

        if (!currentRequestBody || !currentRequestBody.content['multipart/form-data']) {
            this.currentRoute.requestBody = {
                description: 'Multipart form-data for file upload',
                content: {
                    'multipart/form-data': {
                        schema: {
                            type: 'object',
                            properties: {
                                [fieldName]: {
                                    type: 'string',
                                    format: 'binary',
                                    description,
                                },
                            },
                            required: required ? [fieldName] : [],
                        },
                    },
                },
                required,
            };
        } else {
            const properties = this.currentRoute.requestBody.content['multipart/form-data'].schema.properties;
            properties[fieldName] = {
                type: 'string',
                format: 'binary',
                description,
            };

            if (required) {
                const requiredFields = this.currentRoute.requestBody.content['multipart/form-data'].schema.required || [];
                if (!requiredFields.includes(fieldName)) {
                    requiredFields.push(fieldName);
                    this.currentRoute.requestBody.content['multipart/form-data'].schema.required = requiredFields;
                }
            }
        }

        if (options.maxSize) {
            this.currentRoute.requestBody.content['multipart/form-data'].schema.properties[fieldName].maxLength = options.maxSize;
        }

        return this;
    }

    /**
     * Add form field
     */
    addFormField(fieldName, type = 'string', description = 'Form field', required = false, options = {}) {
        this.validateCurrentRoute();

        const currentRequestBody = this.currentRoute.requestBody;

        if (!currentRequestBody || !currentRequestBody.content['multipart/form-data']) {
            this.currentRoute.requestBody = {
                description: 'Multipart form-data',
                content: {
                    'multipart/form-data': {
                        schema: {
                            type: 'object',
                            properties: {
                                [fieldName]: {
                                    type,
                                    description,
                                },
                            },
                            required: required ? [fieldName] : [],
                        },
                    },
                },
                required,
            };
        } else {
            const properties = this.currentRoute.requestBody.content['multipart/form-data'].schema.properties;
            properties[fieldName] = {
                type,
                description,
            };

            if (options.enum) {
                properties[fieldName].enum = options.enum;
            }

            if (required) {
                const requiredFields = this.currentRoute.requestBody.content['multipart/form-data'].schema.required || [];
                if (!requiredFields.includes(fieldName)) {
                    requiredFields.push(fieldName);
                    this.currentRoute.requestBody.content['multipart/form-data'].schema.required = requiredFields;
                }
            }
        }

        return this;
    }

    /**
     * Add response with enhanced options
     * Supports both schema references and inline schemas
     */
    addResponse(statusCode, description, schemaRef = null, options = {}) {
        this.validateCurrentRoute();

        const response = { description };

        if (schemaRef) {
            const isReference = typeof schemaRef === 'string' && schemaRef.startsWith('#/');

            response.content = {
                'application/json': {
                    schema: isReference ? { $ref: schemaRef } : this.normalizeSchema(schemaRef),
                },
            };

            if (options.examples) {
                response.content['application/json'].examples = options.examples;
            }
        }

        if (options.headers) {
            response.headers = options.headers;
        }

        this.currentRoute.responses[statusCode] = response;
        return this;
    }

    /**
     * Add multiple responses at once
     */
    addResponses(responsesConfig) {
        this.validateCurrentRoute();

        for (const statusCode in responsesConfig) {
            const config = responsesConfig[statusCode];
            this.addResponse(
                statusCode,
                config.description,
                config.schema || null,
                config.options || {}
            );
        }

        return this;
    }

    /**
     * Add standard error responses
     */
    addStandardErrorResponses() {
        this.addResponse(400, 'Bad Request - Invalid input');
        this.addResponse(401, 'Unauthorized - Authentication required');
        this.addResponse(403, 'Forbidden - Insufficient permissions');
        this.addResponse(404, 'Not Found - Resource not found');
        this.addResponse(500, 'Internal Server Error');
        return this;
    }

    /**
     * Add standard success response for common operations
     */
    addStandardSuccessResponse(operationType = 'retrieved') {
        const messages = {
            created: 'Resource created successfully',
            updated: 'Resource updated successfully',
            deleted: 'Resource deleted successfully',
            retrieved: 'Resource retrieved successfully',
        };

        this.addResponse(200, messages[operationType] || messages.retrieved);
        return this;
    }

    /**
     * Add security requirement to route
     */
    addSecurity(securityScheme, scopes = []) {
        this.validateCurrentRoute();

        if (!this.currentRoute.security) {
            this.currentRoute.security = [];
        }

        this.currentRoute.security.push({
            [securityScheme]: scopes
        });
        return this;
    }

    /**
     * Remove security requirement (public endpoint)
     */
    removeSecurityent() {
        this.validateCurrentRoute();
        this.currentRoute.security = [];
        return this;
    }

    /**
     * Add tags to current route
     */
    addTags(tags) {
        this.validateCurrentRoute();

        if (Array.isArray(tags)) {
            this.currentRoute.tags = this.currentRoute.tags.concat(tags);
        } else {
            this.currentRoute.tags.push(tags);
        }

        return this;
    }

    /**
     * Convert to multipart
     */
    convertToMultipart() {
        const currentRequestBody = this.currentRoute.requestBody;

        if (currentRequestBody && currentRequestBody.content['application/json']) {
            const jsonSchema = currentRequestBody.content['application/json'].schema;
            this.currentRoute.requestBody = {
                description: 'Multipart form-data',
                content: {
                    'multipart/form-data': {
                        schema: {
                            type: 'object',
                            properties: {
                                data: {
                                    allOf: [jsonSchema],
                                },
                            },
                        },
                    },
                },
            };
        }
    }

    /**
     * Add schema to multipart
     */
    addSchemaToMultipart(schemaRef) {
        const currentRequestBody = this.currentRoute.requestBody;

        if (currentRequestBody && currentRequestBody.content['multipart/form-data']) {
            currentRequestBody.content['multipart/form-data'].schema.properties.data = {
                allOf: [{ $ref: schemaRef }],
            };
        }
    }

    /**
     * Validate current route exists
     */
    validateCurrentRoute() {
        if (!this.currentRoute) {
            throw new Error('No route is currently being built. Call addRoute() first.');
        }
    }

    /**
     * Build all routes
     */
    build() {
        return this.routes;
    }

    /**
     * Get current route being built
     */
    getCurrentRoute() {
        return this.currentRoute;
    }

    /**
     * Get all routes
     */
    getRoutes() {
        return this.routes;
    }

    /**
     * Clear all routes
     */
    clearRoutes() {
        this.routes = {};
        this.currentPath = null;
        this.currentHttpMethod = null;
        this.currentRoute = null;
        return this;
    }

    /**
     * Generate filename from description
     */
    generateFileName() {
        return this.groupDescription
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');
    }

    /**
     * Save to custom directory
     */
    saveToFile(fileName, dirPath = 'swagger/routes') {
        if (process.env.NODE_ENV !== 'development') {
            return this;
        }

        try {
            if (!fileName) fileName = this.generateFileName();
            const filePath = path.join(dirPath, `${fileName}.json`);

            fs.mkdirSync(dirPath, { recursive: true });
            fs.writeFileSync(filePath, JSON.stringify(this.build(), null, 2), 'utf8');

            // this.logger.info(`Swagger spec saved to ${filePath}`);
        } catch (error) {
            this.logger.error(`Failed to save swagger spec: ${error.message}`);
        }

        return this;
    }

    /**
     * Save to module spec folder (supports both src/modules and src/shared/modules)
     */
    saveToModuleSpecFolder(moduleName, fileName, isSharedModule = false) {
        if (process.env.NODE_ENV !== 'development') {
            return this;
        }

        try {
            if (!fileName) fileName = this.generateFileName();

            const baseModulePath = isSharedModule ?
                path.join(__dirname, '../../../shared/modules') :
                path.join(__dirname, '../../../modules');

            const modulePath = path.join(baseModulePath, moduleName);

            if (!fs.existsSync(modulePath)) {
                throw new Error(`Module "${moduleName}" does not exist in ${baseModulePath}`);
            }

            const specFolderPath = path.join(modulePath, 'swagger/_spec');
            fs.mkdirSync(specFolderPath, { recursive: true });

            const filePath = path.join(specFolderPath, `${fileName}.json`);
            fs.writeFileSync(filePath, JSON.stringify(this.build(), null, 2), 'utf8');

            // this.logger.info(`Swagger spec saved to ${filePath}`);
        } catch (error) {
            this.logger.error(`Failed to save to module: ${error.message}`);
        }

        return this;
    }

    /**
     * Auto-detect module type and save
     */
    saveToModule(moduleName, fileName) {
        const regularModulePath = path.join(__dirname, '../../../modules', moduleName);
        const sharedModulePath = path.join(__dirname, '../../../shared/modules', moduleName);

        if (fs.existsSync(regularModulePath)) {
            return this.saveToModuleSpecFolder(moduleName, fileName, false);
        } else if (fs.existsSync(sharedModulePath)) {
            return this.saveToModuleSpecFolder(moduleName, fileName, true);
        } else {
            this.logger.error(`Module "${moduleName}" not found in src/modules or src/shared/modules`);
            return this;
        }
    }
}

module.exports = SwaggerRouteBuilder;