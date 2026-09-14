jest.mock('../../../../config/directory/index', () => {});
const mongoose = require('mongoose');
const { setupTestDB, teardownTestDB } = require('../../../../../tests/setup/db.handler');

const { validGeofence, geofenceWithAllFields } = require('../fixtures/geofence.fixtures');

describe('Geofence CRUD Integration', () => {
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

  describe('POST /api/v1/geofence', () => {
    it('should create a new geofence (200)', async () => {
      const res = await request
        .post('/api/v1/geofence')
        .send(geofenceWithAllFields);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
      createdId = res.body.data._id;
    });


  });

  describe('GET /api/v1/geofence', () => {
    it('should return list of geofences (public)', async () => {
      const res = await request
        .get('/api/v1/geofence')
        .query({ page: 1, perPage: 10 });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
    });
  });

  describe('GET /api/v1/geofence/:id', () => {
    it('should return a geofence by id', async () => {
      expect(createdId).toBeDefined();

      const res = await request
        .get(`/api/v1/geofence/${createdId}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
    });

    it('should return 401/404 for non-existent id', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request
        .get(`/api/v1/geofence/${fakeId}`);

      expect([401, 404]).toContain(res.status);
    });

  });

  describe('PUT /api/v1/geofence/:id', () => {
    it('should update a geofence', async () => {
      expect(createdId).toBeDefined();

      const res = await request
        .put(`/api/v1/geofence/${createdId}`)
        .send({
          zone_name: 'Updated Zone_name',
          type_zone: 'Updated Type_zone',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

  });

  describe('DELETE /api/v1/geofence/:id', () => {
    it('should delete a geofence (soft delete)', async () => {
      expect(createdId).toBeDefined();

      const res = await request
        .delete(`/api/v1/geofence/${createdId}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

  });
});