const supertest = require('supertest');

/**
 * Create a supertest request client for the app.
 * Use for unauthenticated requests.
 *
 * @param {Express.Application} app
 * @returns {supertest.SuperTest}
 *
 * @example
 *   const api = createRequest(app);
 *   await api.get('/health').expect(200);
 */
const createRequest = (app) => {
    return supertest(app);
};

/**
 * Create an authenticated supertest agent.
 * The Authorization header is automatically injected on every request.
 *
 * Uses supertest.agent() so cookies persist across requests,
 * which is useful for session-based auth flows alongside Bearer tokens.
 *
 * @param {Express.Application} app
 * @param {string} token - JWT or API token
 * @returns {supertest.SuperAgentTest}
 *
 * @example
 *   const api = authRequest(app, token);
 *   await api.get('/api/users').expect(200);
 *   await api.post('/api/users').send({ name: 'Gilles' }).expect(201);
 */
const authRequest = (app, token) => {
    const agent = supertest.agent(app);

    // Intercept every outgoing request to inject the auth header.
    // Unlike agent.set(), this actually persists across all requests.
    agent.on('request', (req) => {
        req.set('Authorization', `Bearer ${token}`);
    });

    return agent;
};

/**
 * Create an authenticated request helper WITHOUT cookie persistence.
 * Lighter alternative when you only need token-based auth (no sessions).
 *
 * @param {Express.Application} app
 * @param {string} token - JWT or API token
 * @returns {Object} Object with HTTP method helpers
 *
 * @example
 *   const api = authTokenRequest(app, token);
 *   await api.get('/api/users').expect(200);
 *   await api.post('/api/users').send({ name: 'Gilles' }).expect(201);
 */
const authTokenRequest = (app, token) => {
    const withAuth = (method, url) =>
        supertest(app)[method](url).set('Authorization', `Bearer ${token}`);

    return {
        get: (url) => withAuth('get', url),
        post: (url) => withAuth('post', url),
        put: (url) => withAuth('put', url),
        patch: (url) => withAuth('patch', url),
        delete: (url) => withAuth('delete', url),
    };
};

module.exports = { createRequest, authRequest, authTokenRequest };