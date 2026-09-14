jest.mock('../../../../config/directory/index', () => {});
const mongoose = require('mongoose');
const { setupTestDB, teardownTestDB } = require('../../../../../tests/setup/db.handler');
const { validAdmin, invalidAdmin } = require('../fixtures/admin.fixtures');

describe('Admin CRUD Integration', () => {
  let mongoServer;
  let app;
  let request;
  let createdAdminId;

  beforeAll(async () => {
    ({ mongoServer, app, request } = await setupTestDB(() => require('../../../../app')));
  });

  afterAll(async () => {
    await teardownTestDB(mongoServer);
  });

  describe('POST /api/v1/admin', () => {
    it('should create a new admin (200)', async () => {
      const res = await request
        .post('/api/v1/admin')
        .send({ ...validAdmin, email: 'test.crud@test.com' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
      createdAdminId = res.body.data._id;
    });

    it('should return existing admin for duplicate email (findOrCreate)', async () => {
      const res = await request
        .post('/api/v1/admin')
        .send({ ...validAdmin, email: 'test.crud@test.com' });

      // findOrCreate returns existing record
      expect(res.status).toBe(200);
      expect(res.body.data).toBeDefined();
    });

    it('should fail without required fields', async () => {
      const res = await request
        .post('/api/v1/admin')
        .send(invalidAdmin);

      expect(res.status).not.toBe(200);
    });
  });

  describe('GET /api/v1/admin', () => {
    it('should return paginated list of admins', async () => {
      const res = await request
        .get('/api/v1/admin')
        .query({ page: 1, perPage: 10 });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('should filter by firstName', async () => {
      const res = await request
        .get('/api/v1/admin')
        .query({ firstName: 'Test' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('GET /api/v1/admin/:id', () => {
    it('should return a admin by id', async () => {
      expect(createdAdminId).toBeDefined();

      const res = await request.get(`/api/v1/admin/${createdAdminId}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data._id).toBe(createdAdminId);
    });

    it('should return 404 for non-existent id', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request.get(`/api/v1/admin/${fakeId}`);

      expect(res.status).toBe(404);
    });
  });
});