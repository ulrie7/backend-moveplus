/**
 * Valid admin - all fields including password.
 */
const validAdmin = {
  firstName: 'Jean',
  lastName: 'Dupont',
  email: 'test@example.com',
  roles: ['admin'],
};

/**
 * Admin with alternate values for all fields.
 */
const adminWithAllFields = {
  firstName: 'Pierre',
  lastName: 'Martin',
  email: 'other@example.com',
  roles: ['user'],
};

/**
 * Invalid admin - missing password (required for actor creation).
 */
const invalidAdmin = {
  firstName: 'Jean',
  lastName: 'Dupont',
  email: 'test@example.com',
  roles: ['admin'],
};

/**
 * Update payload for admin profile/entity updates.
 */
const updateAdminData = {
  firstName: 'Updated FirstName',
  lastName: 'Updated LastName',
  email: 'Updated Email',
};

/**
 * Signin test data for auth integration tests.
 */
const signinData = {
  valid: {
    email: 'test@example.com',
    password: 'TestPassword123!',
  },
  invalidPassword: {
    email: 'test@example.com',
    password: 'WrongPassword999!',
  },
  nonExistentEmail: {
    email: 'nonexistent@test.com',
    password: 'TestPassword123!',
  },
};

/**
 * Filter data for list endpoint tests.
 */
const adminFilters = {
  bySearch: { search: 'Jean' },
};

/**
 * Pagination parameters.
 */
const paginationParams = {
  page: '1',
  perPage: '10',
};

module.exports = {
  validAdmin,
  adminWithAllFields,
  invalidAdmin,
  updateAdminData,
  signinData,
  adminFilters,
  paginationParams,
};