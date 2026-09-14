const { validAlert } = require('../fixtures/alert.fixtures');

/**
 * Create a alert via the API and return the created data.
 * Default values come from alert.fixtures.js (validAlert).
 *
 * @param {import('supertest').SuperTest} request - supertest instance bound to the app
 * @param {Object} [overrides={}] - Override default fields
 * @returns {Promise<{ alertRes: object, alertId: string }>}
 */
const createTestAlert = async (request, overrides = {}) => {
    const alertData = {
        ...validAlert,

        ...overrides,
    };

    const alertRes = await request
        .post('/api/v1/alert')
        .send(alertData);

    expect(alertRes.status).toBe(200);
    expect(alertRes.body.data).toBeDefined();

    return { alertRes, alertId: alertRes.body.data._id };
};

module.exports = { createTestAlert };