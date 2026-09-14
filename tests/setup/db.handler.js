const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const supertest = require('supertest');

/**
 * Create MongoMemoryServer, set all test env vars, connect mongoose,
 * load the Express app via appFactory, and return a supertest instance.
 *
 * @param {Function} appFactory - Callback returning the Express app.
 *   Uses a callback so require() resolves relative to the calling test file.
 *   Integration: () => require('../../../../app')
 *   E2E:         () => require('../../src/app')
 *
 * @returns {Promise<{ mongoServer: MongoMemoryServer, app: object, request: supertest.SuperTest }>}
 */
const setupTestDB = async(appFactory) => {
    const mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();

    process.env.NODE_ENV = 'test';
    process.env.MONGO_URI = uri;
    process.env.SECRET_KEY = 'test-secret-key-for-jest';
    process.env.AUTO_LOAD_JOBS = 'false';
    process.env.SWAGGER_ENABLED = 'false';
    process.env.CORS_ENABLED = 'false';
    process.env.SMS_SUPPRESS_ERRORS = 'true';
    process.env.WHATSAPP_SUPPRESS_ERRORS = 'true';
    process.env.EMAIL_SUPPRESS_ERRORS = 'true';

    await mongoose.connect(uri);

    const app = appFactory();
    const request = supertest(app);

    return { mongoServer, app, request };
};

/**
 * Drop database, close mongoose connection, stop MongoMemoryServer.
 *
 * @param {MongoMemoryServer} mongoServer
 */
const teardownTestDB = async(mongoServer) => {
    if (mongoose.connection.readyState !== 0) {
        await mongoose.connection.dropDatabase();
        await mongoose.connection.close();
    }
    if (mongoServer) {
        await mongoServer.stop();
    }
};

module.exports = { setupTestDB, teardownTestDB };