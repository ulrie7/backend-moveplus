const path = require('path');
const { validVehicle } = require('../fixtures/vehicle.fixtures');

/**
 * Create a vehicle via the API and return the created data.
 * Default values come from vehicle.fixtures.js (validVehicle).
 * Uses multipart form data for file upload fields.
 *
 * @param {import('supertest').SuperTest} request - supertest instance bound to the app
 * @param {Object} [overrides={}] - Override default fields
 * @returns {Promise<{ vehicleRes: object, vehicleId: string }>}
 */
const createTestVehicle = async (request, overrides = {}) => {
    const vehicleData = {
        ...validVehicle,

        ...overrides,
    };

    let req = request
        .post('/api/v1/vehicle');

    // Add non-file fields as form fields
    for (const [key, value] of Object.entries(vehicleData)) {
        if (value !== undefined && value !== null) {
            req = req.field(key, (Array.isArray(value) || typeof value === 'object') ? JSON.stringify(value) : String(value));
        }
    }

    // Attach test file for file fields
    const testFilePath = path.join(__dirname, '../fixtures/test-upload.txt');
    req = req.attach('image', testFilePath);

    const vehicleRes = await req;

    expect(vehicleRes.status).toBe(200);
    expect(vehicleRes.body.data).toBeDefined();

    return { vehicleRes, vehicleId: vehicleRes.body.data._id };
};

module.exports = { createTestVehicle };