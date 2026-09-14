const { validRoute } = require('../fixtures/route.fixtures');

/**
 * Create a route via the API and return the created data.
 * Default values come from route.fixtures.js (validRoute).
 *
 * @param {import('supertest').SuperTest} request - supertest instance bound to the app
 * @param {Object} [overrides={}] - Override default fields
 * @returns {Promise<{ routeRes: object, routeId: string }>}
 */
const createTestRoute = async (request, overrides = {}) => {
    const routeData = {
        ...validRoute,

        ...overrides,
    };

    const routeRes = await request
        .post('/api/v1/route')
        .send(routeData);

    expect(routeRes.status).toBe(200);
    expect(routeRes.body.data).toBeDefined();

    return { routeRes, routeId: routeRes.body.data._id };
};

module.exports = { createTestRoute };