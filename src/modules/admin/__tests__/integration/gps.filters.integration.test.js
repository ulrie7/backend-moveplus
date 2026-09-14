jest.mock('../../../../config/directory/index', () => {});
const { setupTestDB, teardownTestDB } = require('../../../../../tests/setup/db.handler');
const { createTestGPS } = require('../helpers/gps.helper');

describe('GPS Filters Integration', () => {
  let mongoServer;
  let app;
  let request;

  beforeAll(async () => {
    ({ mongoServer, app, request } = await setupTestDB(() => require('../../../../app')));

    // Seed gpss for filtering
    await createTestGPS(request, {
      imei: 'imei_Alpha',
      status: 'status_Alpha',
      battery: 1001,
      brand: 'brand_Alpha',
      last_connexion: '2020-01-01',
      model_device: 'model_device_Alpha',
    });
    await createTestGPS(request, {
      imei: 'imei_Beta',
      status: 'status_Beta',
      battery: 2002,
      brand: 'brand_Beta',
      last_connexion: '2021-06-15',
      model_device: 'model_device_Beta',
    });
    await createTestGPS(request, {
      imei: 'imei_Gamma',
      status: 'status_Gamma',
      battery: 3003,
      brand: 'brand_Gamma',
      last_connexion: '2023-12-01',
      model_device: 'model_device_Gamma',
    });
  });

  afterAll(async () => {
    await teardownTestDB(mongoServer);
  });

  describe('GET /api/v1/gps with filters', () => {

    it('should filter by battery range (greaterThan)', async () => {
      const res = await request
        .get('/api/v1/gps')
        .query({ batteryGreaterThan: 1500 });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should filter by battery range (lessThan)', async () => {
      const res = await request
        .get('/api/v1/gps')
        .query({ batteryLessThan: 2500 });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should filter by last_connexion range', async () => {
      const res = await request
        .get('/api/v1/gps')
        .query({
          last_connexionStart: '2021-01-01',
          last_connexionEnd: '2022-12-31',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should paginate results', async () => {
      const res = await request
        .get('/api/v1/gps')
        .query({ page: 1, perPage: 2 });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBeLessThanOrEqual(2);
    });
  });
});