jest.mock('../../../../config/directory/index', () => {});
const { setupTestDB, teardownTestDB } = require('../../../../../tests/setup/db.handler');
const { createAndActivateAdmin } = require('../helpers/admin.helper');

describe('Admin Filters Integration', () => {
  let mongoServer;
  let app;
  let request;

  beforeAll(async () => {
    ({ mongoServer, app, request } = await setupTestDB(() => require('../../../../app')));

    // Seed admins for filtering (no signin needed)
    await createAndActivateAdmin(request, {
      email: 'filter.admin.alpha@test.com',
      password: 'FilterPass123!',
      firstName: 'Admin Alpha',
      lastName: 'Admin Alpha',
      signin: false,
    });
    await createAndActivateAdmin(request, {
      email: 'filter.admin.beta@test.com',
      password: 'FilterPass123!',
      firstName: 'Admin Beta',
      lastName: 'Admin Beta',
      signin: false,
    });
    await createAndActivateAdmin(request, {
      email: 'filter.admin.gamma@test.com',
      password: 'FilterPass123!',
      firstName: 'Admin Gamma',
      lastName: 'Admin Gamma',
      signin: false,
    });
  });

  afterAll(async () => {
    await teardownTestDB(mongoServer);
  });

  describe('GET /api/v1/admin with filters', () => {

    it('should filter by firstName', async () => {
      const res = await request
        .get('/api/v1/admin')
        .query({ firstName: 'Alpha' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should filter by lastName', async () => {
      const res = await request
        .get('/api/v1/admin')
        .query({ lastName: 'Admin Beta' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should paginate results', async () => {
      const res = await request
        .get('/api/v1/admin')
        .query({ page: 1, perPage: 2 });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBeLessThanOrEqual(2);
    });
  });
});