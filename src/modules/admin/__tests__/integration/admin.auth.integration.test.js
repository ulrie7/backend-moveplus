jest.mock('../../../../config/directory/index', () => {});
const { setupTestDB, teardownTestDB } = require('../../../../../tests/setup/db.handler');
const { createAndActivateAdmin } = require('../helpers/admin.helper');
const { signinData } = require('../fixtures/admin.fixtures');

describe('Admin Auth Integration', () => {
  let mongoServer;
  let app;
  let request;
  let accessToken;

  beforeAll(async () => {
    ({ mongoServer, app, request } = await setupTestDB(() => require('../../../../app')));
    await createAndActivateAdmin(request, {
      email: 'auth.admin@test.com',
      password: 'AuthPass123!',
      firstName: 'Auth',
      lastName: 'Admin',
      signin: false,
    });
  });

  afterAll(async () => {
    await teardownTestDB(mongoServer);
  });

  describe('POST /api/v1/admin/auth/signin', () => {
    it('should signin with valid credentials (200 + token)', async () => {
      const res = await request
        .post('/api/v1/admin/auth/signin')
        .send({
          email: 'auth.admin@test.com',
          password: 'AuthPass123!',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.accessToken).toBeDefined();
      accessToken = res.body.accessToken;
    });

    it('should fail with wrong password', async () => {
      const res = await request
        .post('/api/v1/admin/auth/signin')
        .send({ ...signinData.invalidPassword, email: 'auth.admin@test.com' });

      expect(res.status).not.toBe(200);
    });

    it('should fail with non-existent email', async () => {
      const res = await request
        .post('/api/v1/admin/auth/signin')
        .send(signinData.nonExistentEmail);

      expect(res.status).not.toBe(200);
    });

    it('should fail with missing fields', async () => {
      const res = await request
        .post('/api/v1/admin/auth/signin')
        .send({});

      expect(res.status).not.toBe(200);
    });
  });

  describe('Protected routes', () => {
    it('should reject request without token (401)', async () => {
      const res = await request
        .get('/api/v1/admin/profile');

      expect(res.status).toBe(401);
    });

    it('should reject request with invalid token (401)', async () => {
      const res = await request
        .get('/api/v1/admin/profile')
        .set('Authorization', 'Bearer invalid-token-here');

      expect(res.status).toBe(401);
    });

    it('should accept request with valid token', async () => {
      expect(accessToken).toBeDefined();

      const res = await request
        .get('/api/v1/admin/profile')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });
});