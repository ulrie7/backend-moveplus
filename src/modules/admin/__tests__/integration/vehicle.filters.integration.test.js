jest.mock('../../../../config/directory/index', () => {});
const { setupTestDB, teardownTestDB } = require('../../../../../tests/setup/db.handler');
const { createTestVehicle } = require('../helpers/vehicle.helper');

describe('Vehicle Filters Integration', () => {
  let mongoServer;
  let app;
  let request;

  beforeAll(async () => {
    ({ mongoServer, app, request } = await setupTestDB(() => require('../../../../app')));

    // Seed vehicles for filtering
    await createTestVehicle(request, {
      immatriculation: 'immatriculation_Alpha',
      type_vehicule: 'type_vehicule_Alpha',
      brand: 'brand_Alpha',
      modele: 'modele_Alpha',
      color: 'color_Alpha',
      year: 1001,
      status: 'status_Alpha',
    });
    await createTestVehicle(request, {
      immatriculation: 'immatriculation_Beta',
      type_vehicule: 'type_vehicule_Beta',
      brand: 'brand_Beta',
      modele: 'modele_Beta',
      color: 'color_Beta',
      year: 2002,
      status: 'status_Beta',
    });
    await createTestVehicle(request, {
      immatriculation: 'immatriculation_Gamma',
      type_vehicule: 'type_vehicule_Gamma',
      brand: 'brand_Gamma',
      modele: 'modele_Gamma',
      color: 'color_Gamma',
      year: 3003,
      status: 'status_Gamma',
    });
  });

  afterAll(async () => {
    await teardownTestDB(mongoServer);
  });

  describe('GET /api/v1/vehicle with filters', () => {

    it('should filter by year range (greaterThan)', async () => {
      const res = await request
        .get('/api/v1/vehicle')
        .query({ yearGreaterThan: 1500 });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should filter by year range (lessThan)', async () => {
      const res = await request
        .get('/api/v1/vehicle')
        .query({ yearLessThan: 2500 });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should paginate results', async () => {
      const res = await request
        .get('/api/v1/vehicle')
        .query({ page: 1, perPage: 2 });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBeLessThanOrEqual(2);
    });
  });
});