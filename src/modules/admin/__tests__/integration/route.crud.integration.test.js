jest.mock('../../../../config/directory/index', () => {});
const mongoose = require('mongoose');
const { setupTestDB, teardownTestDB } = require('../../../../../tests/setup/db.handler');

const { validRoute, routeWithAllFields } = require('../fixtures/route.fixtures');

describe('Route CRUD Integration', () => {
  let mongoServer;
  let app;
  let request;


  let createdId;

  beforeAll(async () => {
    ({ mongoServer, app, request } = await setupTestDB(() => require('../../../../app')));


  });

  afterAll(async () => {
    await teardownTestDB(mongoServer);
  });

  describe('POST /api/v1/route', () => {
    it('should create a new route (200)', async () => {
      const res = await request
        .post('/api/v1/route')
        .send(routeWithAllFields);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
      createdId = res.body.data._id;
    });


  });

  describe('GET /api/v1/route', () => {
    it('should return list of routes (public)', async () => {
      const res = await request
        .get('/api/v1/route')
        .query({ page: 1, perPage: 10 });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
    });
  });

  describe('GET /api/v1/route/:id', () => {
    it('should return a route by id', async () => {
      expect(createdId).toBeDefined();

      const res = await request
        .get(`/api/v1/route/${createdId}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
    });

    it('should return 401/404 for non-existent id', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request
        .get(`/api/v1/route/${fakeId}`);

      expect([401, 404]).toContain(res.status);
    });

  });

  describe('PUT /api/v1/route/:id', () => {
    it('should update a route', async () => {
      expect(createdId).toBeDefined();

      const res = await request
        .put(`/api/v1/route/${createdId}`)
        .send({
          date_start: '2025-12-31',
          date_end: '2025-12-31',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

  });

  describe('DELETE /api/v1/route/:id', () => {
    it('should delete a route (soft delete)', async () => {
      expect(createdId).toBeDefined();

      const res = await request
        .delete(`/api/v1/route/${createdId}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

  });
});