const swaggerUi = require('swagger-ui-express');
const SwaggerLoader = require('../../shared/lib/swagger/SwaggerLoader');
const SwaggerConfig = require('../../shared/lib/swagger/SwaggerConfig');
const SwaggerProtection = require('../../shared/lib/swagger/SwaggerProtection');

/**
 * Professional Swagger Bootstrap
 * Initializes Swagger documentation with protection and multi-module support
 */
async function bootstrap(app) {
    try {
        // Create and validate configuration
        const config = new SwaggerConfig();

        const validation = config.validate();
        if (!validation.valid) {
            console.error('❌ Swagger configuration validation failed:');
            validation.errors.forEach(error => console.error(`   - ${error}`));
            return;
        }

        // Check if Swagger is enabled
        if (!config.enabled) {
            console.log('ℹ️  Swagger documentation is disabled in this environment'.yellow);
            return;
        }

        // Initialize loader with configuration
        const swaggerLoader = new SwaggerLoader(config);

        // Customize if needed
        swaggerLoader
            .setTitle('Backend Test API Documentation')
            .setDescription('Comprehensive API documentation for managing resources')
            .setVersion('1.0.0');

        config.setContact(
            'OrangCode Community',
            'https://community.orangcode.com',
        );

        // Optional: license info

        // config.setLicense(
        //     'MIT',
        //     'https://opensource.org/licenses/MIT'
        // );

        // // Optional: Add external documentation
        // config.setExternalDocs(
        //     'Full API Documentation',
        //     'https://docs.yourcompany.com/api'
        // );

        //// Optional: Add global tags
        // config.addTag('Users', 'User management endpoints');
        // config.addTag('Authentication', 'Authentication and authorization');

        // Load and generate documentation
        swaggerLoader.initialize();
        const swaggerDocs = swaggerLoader.generateSwaggerDocs();

        // Setup protection middleware
        const protection = new SwaggerProtection(config);

        // Apply middleware stack
        const middlewares = [
            protection.environmentCheck(),
            protection.basicAuth(),
            // Optional: Add IP whitelist
            // protection.ipWhitelist(['127.0.0.1', '::1']),
        ];

        // Swagger UI options
        const swaggerUiOptions = {
            explorer: true,
            swaggerOptions: {
                persistAuthorization: true,
                displayRequestDuration: true,
                filter: true,
                tryItOutEnabled: true,
            },
            customCss: '.swagger-ui .topbar { display: none }',
            customSiteTitle: config.title,
        };

        // Setup Swagger UI with protection
        app.use(
            '/api-docs',
            ...middlewares,
            swaggerUi.serve,
            swaggerUi.setup(swaggerDocs, swaggerUiOptions)
        );

        // Swagger JSON endpoint (also protected)
        app.get('/api-docs.json', ...middlewares, (req, res) => {
            res.json(swaggerDocs);
        });

        // Log statistics
        const stats = swaggerLoader.getStats();
        console.log('\n✅ Swagger Documentation Initialized'.green.bold);
        console.log('━'.repeat(50).gray);
        console.log(`   📍 UI Available at: ${process.env.BASE_URL || 'http://localhost:3000'}/api-docs`.cyan);
        console.log(`   📄 JSON Available at: ${process.env.BASE_URL || 'http://localhost:3000'}/api-docs.json`.cyan);
        console.log('━'.repeat(50).gray);
        console.log(`   📊 Statistics:`.yellow);
        console.log(`      • Schemas: ${stats.schemas}`.gray);
        console.log(`      • Spec Files: ${stats.specFiles}`.gray);
        console.log(`      • API Paths: ${stats.paths}`.gray);
        console.log(`      • Module Paths: ${stats.modulePaths.length}`.gray);

        if (config.protectionEnabled) {
            console.log(`   🔒 Protection: Enabled`.yellow);
            console.log(`      • Username: ${config.username}`.gray);
            console.log(`      • Password: ${'*'.repeat(config.password.length)}`.gray);
        } else {
            console.log(`   🔓 Protection: Disabled (Public Access)`.yellow);
        }

        console.log('━'.repeat(50).gray + '\n');

    } catch (error) {
        console.error('❌ Failed to initialize Swagger:'.red, error.message);
        if (process.env.NODE_ENV === 'development') {
            console.error(error.stack);
        }
    }
}

module.exports = bootstrap;