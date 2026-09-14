const { validGeofence } = require('../fixtures/geofence.fixtures');

/**
 * Create a geofence via the API and return the created data.
 * Default values come from geofence.fixtures.js (validGeofence).
 *
 * @param {import('supertest').SuperTest} request - supertest instance bound to the app
 * @param {Object} [overrides={}] - Override default fields
 * @returns {Promise<{ geofenceRes: object, geofenceId: string }>}
 */
const createTestGeofence = async (request, overrides = {}) => {
    const geofenceData = {
        ...validGeofence,

        ...overrides,
    };

    const geofenceRes = await request
        .post('/api/v1/geofence')
        .send(geofenceData);

    expect(geofenceRes.status).toBe(200);
    expect(geofenceRes.body.data).toBeDefined();

    return { geofenceRes, geofenceId: geofenceRes.body.data._id };
};

module.exports = { createTestGeofence };