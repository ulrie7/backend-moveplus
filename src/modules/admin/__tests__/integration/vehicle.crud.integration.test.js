jest.mock('../../../../config/directory/index', () => {});
const mongoose = require('mongoose');
const path = require('path');
const { setupTestDB, teardownTestDB } = require('../../../../../tests/setup/db.handler');

const { validVehicle, vehicleWithAllFields } = require('../fixtures/vehicle.fixtures');

describe('Vehicle CRUD Integration', () => {
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

  describe('POST /api/v1/vehicle', () => {
    it('should create a new vehicle (200)', async () => {
      let req = request
        .post('/api/v1/vehicle');

      // Add non-file fields as form fields
      for (const [key, value] of Object.entries(vehicleWithAllFields)) {
        if (value !== undefined && value !== null) {
          req = req.field(key, (Array.isArray(value) || typeof value === 'object') ? JSON.stringify(value) : String(value));
        }
      }

      // Attach test file for file fields
      const testFilePath = path.join(__dirname, '../fixtures/test-upload.txt');
      req = req.attach('image', testFilePath);

      const res = await req;

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
      createdId = res.body.data._id;
    });


  });

  describe('GET /api/v1/vehicle', () => {
    it('should return list of vehicles (public)', async () => {
      const res = await request
        .get('/api/v1/vehicle')
        .query({ page: 1, perPage: 10 });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
    });
  });

  describe('GET /api/v1/vehicle/:id', () => {
    it('should return a vehicle by id', async () => {
      expect(createdId).toBeDefined();

      const res = await request
        .get(`/api/v1/vehicle/${createdId}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
    });

    it('should return 401/404 for non-existent id', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request
        .get(`/api/v1/vehicle/${fakeId}`);

      expect([401, 404]).toContain(res.status);
    });

  });

  describe('PUT /api/v1/vehicle/:id', () => {
    it('should update a vehicle', async () => {
      expect(createdId).toBeDefined();

      const res = await request
        .put(`/api/v1/vehicle/${createdId}`)
        .send({
          immatriculation: 'Updated Immatriculation',
          type_vehicule: 'Updated Type_vehicule',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

  });

  describe('DELETE /api/v1/vehicle/:id', () => {
    it('should delete a vehicle (soft delete)', async () => {
      expect(createdId).toBeDefined();

      const res = await request
        .delete(`/api/v1/vehicle/${createdId}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

  });
});