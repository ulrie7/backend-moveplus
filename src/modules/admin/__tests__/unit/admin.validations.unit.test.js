const AdminValidations = require('../../validations/admin.validations');

describe('AdminValidations', () => {
  describe('CreateValidation', () => {
    it('should pass with valid data (password + roles required)', () => {
      const { error } = AdminValidations.CreateValidation({
        firstName: 'Jean',
        lastName: 'Dupont',
        email: 'test@example.com',
        roles: ['admin'],
        password: 'TestPassword123!',
      });
      expect(error).toBeUndefined();
    });

    it('should fail without password', () => {
      const { error } = AdminValidations.CreateValidation({
        firstName: 'Jean',
        lastName: 'Dupont',
        email: 'test@example.com',
        roles: ['admin'],
      });
      expect(error).toBeDefined();
      expect(error.details[0].path).toContain('password');
    });



    it('should allow null values for optional fields', () => {
      const { error } = AdminValidations.CreateValidation({
        roles: ['admin'],
        password: 'TestPassword123!',
        firstName: null,
        lastName: null,
        email: null,
      });
      expect(error).toBeUndefined();
    });


    it('should reject unknown fields', () => {
      const { error } = AdminValidations.CreateValidation({

        unknownField: 'value',
      });
      expect(error).toBeDefined();
    });
  });

  describe('UpdateValidation', () => {
    it('should pass with valid partial data', () => {
      const { error } = AdminValidations.UpdateValidation({
        firstName: 'Updated FirstName',
      });
      expect(error).toBeUndefined();
    });

    it('should pass with empty object', () => {
      const { error } = AdminValidations.UpdateValidation({});
      expect(error).toBeUndefined();
    });

    it('should pass with roles as array', () => {
      const { error } = AdminValidations.UpdateValidation({
        roles: ['admin', 'user'],
      });
      expect(error).toBeUndefined();
    });

    it('should allow null values for optional fields', () => {
      const { error } = AdminValidations.UpdateValidation({
        firstName: null,
        lastName: null,
        email: null,
        roles: null,
      });
      expect(error).toBeUndefined();
    });

    it('should reject unknown fields', () => {
      const { error } = AdminValidations.UpdateValidation({
        unknownField: 'value',
      });
      expect(error).toBeDefined();
    });
  });
});