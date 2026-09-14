const AdminAuthValidations = require('../../validations/auth.admin.validations');

describe('AdminAuthValidations', () => {
  describe('Signin', () => {
    it('should pass with valid data', () => {
      const { error } = AdminAuthValidations.Signin({
        email: 'admin@test.com',
        password: 'Password123',
      });
      expect(error).toBeUndefined();
    });

    it('should fail without email', () => {
      const { error } = AdminAuthValidations.Signin({
        password: 'Password123',
      });
      expect(error).toBeDefined();
    });

    it('should fail without password', () => {
      const { error } = AdminAuthValidations.Signin({
        email: 'admin@test.com',
      });
      expect(error).toBeDefined();
    });
  });

  describe('VerifyAccount', () => {
    it('should pass with valid data', () => {
      const { error } = AdminAuthValidations.VerifyAccount({
        email: 'admin@test.com',
        code: '123456',
      });
      expect(error).toBeUndefined();
    });

    it('should fail without code', () => {
      const { error } = AdminAuthValidations.VerifyAccount({
        email: 'admin@test.com',
      });
      expect(error).toBeDefined();
    });
  });

  describe('RefreshToken', () => {
    it('should pass with valid data', () => {
      const { error } = AdminAuthValidations.RefreshToken({
        refreshToken: 'some-refresh-token',
      });
      expect(error).toBeUndefined();
    });

    it('should fail without refreshToken', () => {
      const { error } = AdminAuthValidations.RefreshToken({});
      expect(error).toBeDefined();
    });
  });

  describe('ActivateMFAToken', () => {
    it('should pass with valid data', () => {
      const { error } = AdminAuthValidations.ActivateMFAToken({
        accessToken: 'some-token',
        code: '123456',
      });
      expect(error).toBeUndefined();
    });

    it('should fail without accessToken', () => {
      const { error } = AdminAuthValidations.ActivateMFAToken({
        code: '123456',
      });
      expect(error).toBeDefined();
    });
  });

  describe('ChangePassword', () => {
    it('should pass with valid data', () => {
      const { error } = AdminAuthValidations.ChangePassword({
        oldPassword: 'OldPass123',
        newPassword: 'NewPass456',
      });
      expect(error).toBeUndefined();
    });

    it('should fail without newPassword', () => {
      const { error } = AdminAuthValidations.ChangePassword({
        oldPassword: 'OldPass123',
      });
      expect(error).toBeDefined();
    });
  });

  describe('GeneratePasswordResetCode', () => {
    it('should pass with valid data', () => {
      const { error } = AdminAuthValidations.GeneratePasswordResetCode({
        email: 'admin@test.com',
      });
      expect(error).toBeUndefined();
    });

    it('should fail without email', () => {
      const { error } = AdminAuthValidations.GeneratePasswordResetCode({});
      expect(error).toBeDefined();
    });
  });

  describe('VerifyPasswordResetCode', () => {
    it('should pass with valid data', () => {
      const { error } = AdminAuthValidations.VerifyPasswordResetCode({
        email: 'admin@test.com',
        code: '123456',
      });
      expect(error).toBeUndefined();
    });

    it('should fail without code', () => {
      const { error } = AdminAuthValidations.VerifyPasswordResetCode({
        email: 'admin@test.com',
      });
      expect(error).toBeDefined();
    });
  });

  describe('ResetPassword', () => {
    it('should pass with valid data', () => {
      const { error } = AdminAuthValidations.ResetPassword({
        token: 'reset-token',
        password: 'NewPassword123',
      });
      expect(error).toBeUndefined();
    });

    it('should fail without token', () => {
      const { error } = AdminAuthValidations.ResetPassword({
        password: 'NewPassword123',
      });
      expect(error).toBeDefined();
    });
  });

  describe('ResendMFACode', () => {
    it('should pass with valid data', () => {
      const { error } = AdminAuthValidations.ResendMFACode({
        accessToken: 'some-token',
      });
      expect(error).toBeUndefined();
    });

    it('should fail without accessToken', () => {
      const { error } = AdminAuthValidations.ResendMFACode({});
      expect(error).toBeDefined();
    });
  });

  describe('ResendAccountVerificationCode', () => {
    it('should pass with valid data', () => {
      const { error } = AdminAuthValidations.ResendAccountVerificationCode({
        email: 'admin@test.com',
      });
      expect(error).toBeUndefined();
    });

    it('should fail without email', () => {
      const { error } = AdminAuthValidations.ResendAccountVerificationCode({});
      expect(error).toBeDefined();
    });
  });
});