jest.mock('../../../../config/directory/index', () => {});
const { setupTestDB, teardownTestDB } = require('../../../../../tests/setup/db.handler');
const { createTestAlert } = require('../helpers/alert.helper');

describe('Alert Filters Integration', () => {
  let mongoServer;
  let app;
  let request;

  beforeAll(async () => {
    ({ mongoServer, app, request } = await setupTestDB(() => require('../../../../app')));

    // Seed alerts for filtering
    await createTestAlert(request, {
      alert_type: 'alert_type_Alpha',
      seuil: 'seuil_Alpha',
      date_generation: '2020-01-01',
      status: 'status_Alpha',
      message: 'message_Alpha',
    });
    await createTestAlert(request, {
      alert_type: 'alert_type_Beta',
      seuil: 'seuil_Beta',
      date_generation: '2021-06-15',
      status: 'status_Beta',
      message: 'message_Beta',
    });
    await createTestAlert(request, {
      alert_type: 'alert_type_Gamma',
      seuil: 'seuil_Gamma',
      date_generation: '2023-12-01',
      status: 'status_Gamma',
      message: 'message_Gamma',
    });
  });

  afterAll(async () => {
    await teardownTestDB(mongoServer);
  });

  describe('GET /api/v1/alert with filters', () => {

    it('should filter by date_generation range', async () => {
      const res = await request
        .get('/api/v1/alert')
        .query({
          date_generationStart: '2021-01-01',
          date_generationEnd: '2022-12-31',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should paginate results', async () => {
      const res = await request
        .get('/api/v1/alert')
        .query({ page: 1, perPage: 2 });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBeLessThanOrEqual(2);
    });
  });
});