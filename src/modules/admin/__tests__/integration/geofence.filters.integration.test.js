jest.mock('../../../../config/directory/index', () => {});
const { setupTestDB, teardownTestDB } = require('../../../../../tests/setup/db.handler');
const { createTestGeofence } = require('../helpers/geofence.helper');

describe('Geofence Filters Integration', () => {
  let mongoServer;
  let app;
  let request;

  beforeAll(async () => {
    ({ mongoServer, app, request } = await setupTestDB(() => require('../../../../app')));

    // Seed geofences for filtering
    await createTestGeofence(request, {
      zone_name: 'Geofence Alpha',
      type_zone: 'type_zone_Alpha',
      coordinates: 'coordinates_Alpha',
      perimeter: 1001,
      statut: true,
    });
    await createTestGeofence(request, {
      zone_name: 'Geofence Beta',
      type_zone: 'type_zone_Beta',
      coordinates: 'coordinates_Beta',
      perimeter: 2002,
      statut: false,
    });
    await createTestGeofence(request, {
      zone_name: 'Geofence Gamma',
      type_zone: 'type_zone_Gamma',
      coordinates: 'coordinates_Gamma',
      perimeter: 3003,
      statut: false,
    });
  });

  afterAll(async () => {
    await teardownTestDB(mongoServer);
  });

  describe('GET /api/v1/geofence with filters', () => {

    it('should filter by zone_name', async () => {
      const res = await request
        .get('/api/v1/geofence')
        .query({ zone_name: 'Alpha' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should filter by perimeter range (greaterThan)', async () => {
      const res = await request
        .get('/api/v1/geofence')
        .query({ perimeterGreaterThan: 1500 });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should filter by perimeter range (lessThan)', async () => {
      const res = await request
        .get('/api/v1/geofence')
        .query({ perimeterLessThan: 2500 });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should paginate results', async () => {
      const res = await request
        .get('/api/v1/geofence')
        .query({ page: 1, perPage: 2 });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBeLessThanOrEqual(2);
    });
  });
});