const mongoose = require('mongoose');
const { validAdmin } = require('../fixtures/admin.fixtures');

/**
 * Create a admin via the API, activate it in the DB, and optionally sign in.
 * Default values come from admin.fixtures.js (validAdmin).
 *
 * @param {import('supertest').SuperTest} request - supertest instance bound to the app
 * @param {Object} [options={}]
 * @param {string} [options.email] - defaults to validAdmin.email
 * @param {string} [options.password] - defaults to validAdmin.password
 * @param {string} [options.firstName] - defaults to validAdmin.firstName
 * @param {string} [options.lastName] - defaults to validAdmin.lastName
 * @param {objectarray} [options.roles] - defaults to validAdmin.roles
 * @param {boolean} [options.signin=true] - Whether to also sign in and return tokens
 * @returns {Promise<{ createRes: object, signinRes?: object, adminToken?: string, refreshToken?: string }>}
 */
const createAndActivateAdmin = async (request, options = {}) => {
    const {
        firstName = validAdmin.firstName,
        lastName = validAdmin.lastName,
        email = validAdmin.email,
        roles = validAdmin.roles,
        signin = true,
    } = options;

    const createRes = await request.post('/api/v1/admin').send({
        firstName,
        lastName,
        email,
        roles,
    });
    expect(createRes.status).toBe(200);

    await activateAdmin(email);

    const result = { createRes };

    if (signin) {
        const signinRes = await request.post('/api/v1/admin/auth/signin').send({
            email,
            password,
        });
        expect(signinRes.status).toBe(200);

        result.signinRes = signinRes;
        result.adminToken = signinRes.body.accessToken;
        result.refreshToken = signinRes.body.refreshToken;
        expect(result.adminToken).toBeDefined();
    }

    return result;
};

/**
 * Activate a admin that was already created via the API.
 * Updates relevant collections for dual activation.
 *
 * @param {string} email - The admin's email
 */
const activateAdmin = async (email) => {
    await mongoose.connection.db.collection('admins').updateOne(
        { email },
        { $set: { isActive: true } }
    );
    await mongoose.connection.db.collection('authidentities').updateOne(
        { identifier: email, actorType: 'admin' },
        { $set: { isActive: true } }
    );
};

/**
 * Return an authorization header object for supertest .set().
 *
 * @param {string} token - JWT token
 * @returns {{ Authorization: string }}
 */
const getAuthHeader = (token) => {
    return { Authorization: `Bearer ${token}` };
};

module.exports = { createAndActivateAdmin, activateAdmin, getAuthHeader };