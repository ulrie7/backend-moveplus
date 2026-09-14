jest.mock('../../../../config/directory/index', () => {});
const { setupTestDB, teardownTestDB } = require('../../../../../tests/setup/db.handler');
const { createTestReport } = require('../helpers/report.helper');

describe('Report Filters Integration', () => {
  let mongoServer;
  let app;
  let request;

  beforeAll(async () => {
    ({ mongoServer, app, request } = await setupTestDB(() => require('../../../../app')));

    // Seed reports for filtering
    await createTestReport(request, {
      report_type: 'report_type_Alpha',
      date_generation: '2020-01-01',
      periode_debut: '2020-01-01',
      periode_fin: '2020-01-01',
      statut: '2020-01-01',
    });
    await createTestReport(request, {
      report_type: 'report_type_Beta',
      date_generation: '2021-06-15',
      periode_debut: '2021-06-15',
      periode_fin: '2021-06-15',
      statut: '2021-06-15',
    });
    await createTestReport(request, {
      report_type: 'report_type_Gamma',
      date_generation: '2023-12-01',
      periode_debut: '2023-12-01',
      periode_fin: '2023-12-01',
      statut: '2023-12-01',
    });
  });

  afterAll(async () => {
    await teardownTestDB(mongoServer);
  });

  describe('GET /api/v1/report with filters', () => {

    it('should filter by date_generation range', async () => {
      const res = await request
        .get('/api/v1/report')
        .query({
          date_generationStart: '2021-01-01',
          date_generationEnd: '2022-12-31',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should filter by periode_debut range', async () => {
      const res = await request
        .get('/api/v1/report')
        .query({
          periode_debutStart: '2021-01-01',
          periode_debutEnd: '2022-12-31',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should filter by periode_fin range', async () => {
      const res = await request
        .get('/api/v1/report')
        .query({
          periode_finStart: '2021-01-01',
          periode_finEnd: '2022-12-31',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should filter by statut range', async () => {
      const res = await request
        .get('/api/v1/report')
        .query({
          statutStart: '2021-01-01',
          statutEnd: '2022-12-31',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should paginate results', async () => {
      const res = await request
        .get('/api/v1/report')
        .query({ page: 1, perPage: 2 });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBeLessThanOrEqual(2);
    });
  });
});