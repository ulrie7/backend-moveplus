const { validGPS } = require('../fixtures/gps.fixtures');

/**
 * Create a gps via the API and return the created data.
 * Default values come from gps.fixtures.js (validGPS).
 *
 * @param {import('supertest').SuperTest} request - supertest instance bound to the app
 * @param {Object} [overrides={}] - Override default fields
 * @returns {Promise<{ gPSRes: object, gPSId: string }>}
 */
const createTestGPS = async (request, overrides = {}) => {
    const gPSData = {
        ...validGPS,

        ...overrides,
    };

    const gPSRes = await request
        .post('/api/v1/gps')
        .send(gPSData);

    expect(gPSRes.status).toBe(200);
    expect(gPSRes.body.data).toBeDefined();

    return { gPSRes, gPSId: gPSRes.body.data._id };
};

module.exports = { createTestGPS };