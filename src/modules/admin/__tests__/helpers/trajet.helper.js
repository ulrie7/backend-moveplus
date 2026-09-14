const { validTrajet } = require('../fixtures/trajet.fixtures');

/**
 * Create a trajet via the API and return the created data.
 * Default values come from trajet.fixtures.js (validTrajet).
 *
 * @param {import('supertest').SuperTest} request - supertest instance bound to the app
 * @param {Object} [overrides={}] - Override default fields
 * @returns {Promise<{ trajetRes: object, trajetId: string }>}
 */
const createTestTrajet = async (request, overrides = {}) => {
    const trajetData = {
        ...validTrajet,

        ...overrides,
    };

    const trajetRes = await request
        .post('/api/v1/trajet')
        .send(trajetData);

    expect(trajetRes.status).toBe(200);
    expect(trajetRes.body.data).toBeDefined();

    return { trajetRes, trajetId: trajetRes.body.data._id };
};

module.exports = { createTestTrajet };