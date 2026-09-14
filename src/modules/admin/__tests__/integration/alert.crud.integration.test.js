jest.mock('../../../../config/directory/index', () => {});
const mongoose = require('mongoose');
const { setupTestDB, teardownTestDB } = require('../../../../../tests/setup/db.handler');

const { validAlert, alertWithAllFields } = require('../fixtures/alert.fixtures');

describe('Alert CRUD Integration', () => {
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

  describe('POST /api/v1/alert', () => {
    it('should create a new alert (200)', async () => {
      const res = await request
        .post('/api/v1/alert')
        .send(alertWithAllFields);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
      createdId = res.body.data._id;
    });


  });

  describe('GET /api/v1/alert', () => {
    it('should return list of alerts (public)', async () => {
      const res = await request
        .get('/api/v1/alert')
        .query({ page: 1, perPage: 10 });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
    });
  });

  describe('GET /api/v1/alert/:id', () => {
    it('should return a alert by id', async () => {
      expect(createdId).toBeDefined();

      const res = await request
        .get(`/api/v1/alert/${createdId}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
    });

    it('should return 401/404 for non-existent id', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request
        .get(`/api/v1/alert/${fakeId}`);

      expect([401, 404]).toContain(res.status);
    });

  });

  describe('PUT /api/v1/alert/:id', () => {
    it('should update a alert', async () => {
      expect(createdId).toBeDefined();

      const res = await request
        .put(`/api/v1/alert/${createdId}`)
        .send({
          alert_type: 'Updated Alert_type',
          seuil: 'Updated Seuil',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

  });

  describe('DELETE /api/v1/alert/:id', () => {
    it('should delete a alert (soft delete)', async () => {
      expect(createdId).toBeDefined();

      const res = await request
        .delete(`/api/v1/alert/${createdId}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

  });
});