const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

describe('AdminAuthServices Unit Tests', () => {
  let mongoServer;
  let AdminAuthServices;
  let authServices;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();

    process.env.NODE_ENV = 'test';
    process.env.MONGO_URI = uri;
    process.env.SECRET_KEY = 'test-secret-key-for-jest';
    process.env.SMS_SUPPRESS_ERRORS = 'true';
    process.env.WHATSAPP_SUPPRESS_ERRORS = 'true';

    await mongoose.connect(uri);

    AdminAuthServices = require('../../services/auth.admin.services');
    authServices = new AdminAuthServices();
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    if (mongoServer) await mongoServer.stop();
  });

  describe('signin', () => {
    it('should throw NotFoundError for non-existent account', async () => {
      await expect(
        authServices.signin({
          email: 'nonexistent@test.com',
          password: 'SomePass123!',
        }, {})
      ).rejects.toThrow();
    });
  });

  describe('verifyAccount', () => {
    it('should throw NotFoundError for non-existent email', async () => {
      await expect(
        authServices.verifyAccount({
          email: 'nonexistent@test.com',
          code: '123456',
        })
      ).rejects.toThrow();
    });
  });

  describe('resendAccountVerificationCode', () => {
    it('should throw NotFoundError for non-existent email', async () => {
      await expect(
        authServices.resendAccountVerificationCode({
          email: 'nonexistent@test.com',
        })
      ).rejects.toThrow();
    });
  });

  describe('generatePasswordResetCode', () => {
    it('should throw NotFoundError for non-existent email', async () => {
      await expect(
        authServices.generatePasswordResetCode({
          email: 'nonexistent@test.com',
        })
      ).rejects.toThrow();
    });
  });

  describe('verifyPasswordResetCode', () => {
    it('should throw NotFoundError for non-existent email', async () => {
      await expect(
        authServices.verifyPasswordResetCode({
          email: 'nonexistent@test.com',
          code: '123456',
        })
      ).rejects.toThrow();
    });
  });

  describe('validateRole', () => {
    it('should return model when role matches', () => {
      const model = { roles: ['admin', 'user'] };
      const result = authServices.validateRole(['admin'], model);
      expect(result).toBe(model);
    });

    it('should return model when wildcard role "*" is used', () => {
      const model = { roles: ['user'] };
      const result = authServices.validateRole(['*'], model);
      expect(result).toBe(model);
    });

    it('should return model when empty roles defaults to wildcard', () => {
      const model = { roles: ['user'] };
      const result = authServices.validateRole([], model);
      expect(result).toBe(model);
    });

    it('should return false when role does not match', () => {
      const model = { roles: ['user'] };
      const result = authServices.validateRole(['superadmin'], model);
      expect(result).toBe(false);
    });
  });

  describe('authorizeAdmin', () => {
    it('should return failure when no id or token', async () => {
      const result = await authServices.authorizeAdmin({
        id: null,
        token: null,
        roles: ['admin'],
      });
      expect(result.success).toBe(false);
    });
  });
});