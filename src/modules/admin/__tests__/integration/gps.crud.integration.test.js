jest.mock('../../../../config/directory/index', () => {});
const mongoose = require('mongoose');
const { setupTestDB, teardownTestDB } = require('../../../../../tests/setup/db.handler');

const { validGPS, gPSWithAllFields } = require('../fixtures/gps.fixtures');

describe('GPS CRUD Integration', () => {
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

  describe('POST /api/v1/gps', () => {
    it('should create a new gps (200)', async () => {
      const res = await request
        .post('/api/v1/gps')
        .send(gPSWithAllFields);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
      createdId = res.body.data._id;
    });


  });

  describe('GET /api/v1/gps', () => {
    it('should return list of gpss (public)', async () => {
      const res = await request
        .get('/api/v1/gps')
        .query({ page: 1, perPage: 10 });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
    });
  });

  describe('GET /api/v1/gps/:id', () => {
    it('should return a gps by id', async () => {
      expect(createdId).toBeDefined();

      const res = await request
        .get(`/api/v1/gps/${createdId}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
    });

    it('should return 401/404 for non-existent id', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request
        .get(`/api/v1/gps/${fakeId}`);

      expect([401, 404]).toContain(res.status);
    });

  });

  describe('PUT /api/v1/gps/:id', () => {
    it('should update a gps', async () => {
      expect(createdId).toBeDefined();

      const res = await request
        .put(`/api/v1/gps/${createdId}`)
        .send({
          imei: 'Updated Imei',
          status: 'Updated Status',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

  });

  describe('DELETE /api/v1/gps/:id', () => {
    it('should delete a gps (soft delete)', async () => {
      expect(createdId).toBeDefined();

      const res = await request
        .delete(`/api/v1/gps/${createdId}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

  });
});