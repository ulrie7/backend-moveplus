jest.mock('../../../../config/directory/index', () => {});
const { setupTestDB, teardownTestDB } = require('../../../../../tests/setup/db.handler');
const { createAndActivateAdmin } = require('../helpers/admin.helper');
const { updateAdminData } = require('../fixtures/admin.fixtures');

describe('Admin Profile Integration', () => {
  let mongoServer;
  let app;
  let request;
  let adminToken;

  beforeAll(async () => {
    ({ mongoServer, app, request } = await setupTestDB(() => require('../../../../app')));
    ({ adminToken } = await createAndActivateAdmin(request, {
      email: 'profile.admin@test.com',
      password: 'ProfilePass123!',
      firstName: 'Profile',
      lastName: 'Admin',
    }));
  });

  afterAll(async () => {
    await teardownTestDB(mongoServer);
  });

  describe('GET /api/v1/admin/profile', () => {
    it('should return current admin profile (200)', async () => {
      const res = await request
        .get('/api/v1/admin/profile')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
    });
  });

  describe('PUT /api/v1/admin/profile', () => {
    it('should update admin profile (200)', async () => {
      const res = await request
        .put('/api/v1/admin/profile')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateAdminData);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('DELETE /api/v1/admin/profile', () => {
    it('should delete admin profile (200)', async () => {
      const res = await request
        .delete('/api/v1/admin/profile')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });
});