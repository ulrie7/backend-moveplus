jest.mock('../../../../config/directory/index', () => {});
const { setupTestDB, teardownTestDB } = require('../../../../../tests/setup/db.handler');
const { createTestTrajet } = require('../helpers/trajet.helper');

describe('Trajet Filters Integration', () => {
  let mongoServer;
  let app;
  let request;

  beforeAll(async () => {
    ({ mongoServer, app, request } = await setupTestDB(() => require('../../../../app')));

    // Seed trajets for filtering
    await createTestTrajet(request, {
      date_start: '2020-01-01',
      date_end: '2020-01-01',
      stop_time: 1001,
      stop_nb: 1001,
      status: 'status_Alpha',
      distance: 1001,
      average_speed: 1001,
      max_speed: 1001,
    });
    await createTestTrajet(request, {
      date_start: '2021-06-15',
      date_end: '2021-06-15',
      stop_time: 2002,
      stop_nb: 2002,
      status: 'status_Beta',
      distance: 2002,
      average_speed: 2002,
      max_speed: 2002,
    });
    await createTestTrajet(request, {
      date_start: '2023-12-01',
      date_end: '2023-12-01',
      stop_time: 3003,
      stop_nb: 3003,
      status: 'status_Gamma',
      distance: 3003,
      average_speed: 3003,
      max_speed: 3003,
    });
  });

  afterAll(async () => {
    await teardownTestDB(mongoServer);
  });

  describe('GET /api/v1/trajet with filters', () => {

    it('should filter by stop_time range (greaterThan)', async () => {
      const res = await request
        .get('/api/v1/trajet')
        .query({ stop_timeGreaterThan: 1500 });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should filter by stop_time range (lessThan)', async () => {
      const res = await request
        .get('/api/v1/trajet')
        .query({ stop_timeLessThan: 2500 });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should filter by stop_nb range (greaterThan)', async () => {
      const res = await request
        .get('/api/v1/trajet')
        .query({ stop_nbGreaterThan: 1500 });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should filter by stop_nb range (lessThan)', async () => {
      const res = await request
        .get('/api/v1/trajet')
        .query({ stop_nbLessThan: 2500 });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should filter by distance range (greaterThan)', async () => {
      const res = await request
        .get('/api/v1/trajet')
        .query({ distanceGreaterThan: 1500 });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should filter by distance range (lessThan)', async () => {
      const res = await request
        .get('/api/v1/trajet')
        .query({ distanceLessThan: 2500 });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should filter by average_speed range (greaterThan)', async () => {
      const res = await request
        .get('/api/v1/trajet')
        .query({ average_speedGreaterThan: 1500 });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should filter by average_speed range (lessThan)', async () => {
      const res = await request
        .get('/api/v1/trajet')
        .query({ average_speedLessThan: 2500 });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should filter by max_speed range (greaterThan)', async () => {
      const res = await request
        .get('/api/v1/trajet')
        .query({ max_speedGreaterThan: 1500 });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should filter by max_speed range (lessThan)', async () => {
      const res = await request
        .get('/api/v1/trajet')
        .query({ max_speedLessThan: 2500 });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should filter by date_start range', async () => {
      const res = await request
        .get('/api/v1/trajet')
        .query({
          date_startStart: '2021-01-01',
          date_startEnd: '2022-12-31',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should filter by date_end range', async () => {
      const res = await request
        .get('/api/v1/trajet')
        .query({
          date_endStart: '2021-01-01',
          date_endEnd: '2022-12-31',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should paginate results', async () => {
      const res = await request
        .get('/api/v1/trajet')
        .query({ page: 1, perPage: 2 });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBeLessThanOrEqual(2);
    });
  });
});