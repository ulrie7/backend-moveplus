const { validReport } = require('../fixtures/report.fixtures');

/**
 * Create a report via the API and return the created data.
 * Default values come from report.fixtures.js (validReport).
 *
 * @param {import('supertest').SuperTest} request - supertest instance bound to the app
 * @param {Object} [overrides={}] - Override default fields
 * @returns {Promise<{ reportRes: object, reportId: string }>}
 */
const createTestReport = async (request, overrides = {}) => {
    const reportData = {
        ...validReport,

        ...overrides,
    };

    const reportRes = await request
        .post('/api/v1/report')
        .send(reportData);

    expect(reportRes.status).toBe(200);
    expect(reportRes.body.data).toBeDefined();

    return { reportRes, reportId: reportRes.body.data._id };
};

module.exports = { createTestReport };