const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

describe('AdminServices Unit Tests', () => {
  let mongoServer;
  let AdminServices;
  let adminServices;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();

    process.env.NODE_ENV = 'test';
    process.env.MONGO_URI = uri;
    process.env.SECRET_KEY = 'test-secret-key-for-jest';
    process.env.SMS_SUPPRESS_ERRORS = 'true';
    process.env.WHATSAPP_SUPPRESS_ERRORS = 'true';

    await mongoose.connect(uri);

    AdminServices = require('../../services/admin.services');
    adminServices = new AdminServices();
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    if (mongoServer) await mongoServer.stop();
  });

  describe('instanceAlreadyExist', () => {
    it('should return null when admin does not exist', async () => {
      const result = await adminServices.instanceAlreadyExist({
        email: 'nonexistent@test.com',
      });
      expect(result).toBeNull();
    });
  });

  describe('findById', () => {
    it('should throw NotFoundError for non-existent id', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      await expect(adminServices.findById(fakeId))
        .rejects
        .toThrow();
    });
  });

  describe('getList', () => {
    it('should return empty array when no admins', async () => {
      const result = await adminServices.getList({});
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('findOne', () => {
    it('should return null for non-existent query', async () => {
      const result = await adminServices.findOne({
        email: 'nobody@test.com',
      });
      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('should throw NotFoundError when admin does not exist', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      await expect(
        adminServices.update({ _id: fakeId }, { firstName: 'Updated FirstName' }, { _id: fakeId })
      ).rejects.toThrow();
    });
  });

  describe('delete', () => {
    it('should throw NotFoundError when admin does not exist', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      await expect(
        adminServices.delete({ _id: fakeId }, { _id: fakeId })
      ).rejects.toThrow();
    });
  });

  describe('deleteProfile', () => {
    it('should throw NotFoundError when profile does not exist', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      await expect(
        adminServices.deleteProfile({ _id: fakeId })
      ).rejects.toThrow();
    });
  });

  describe('updateProfile', () => {
    it('should throw NotFoundError when admin does not exist', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      await expect(
        adminServices.updateProfile({ firstName: 'Updated FirstName' }, { _id: fakeId })
      ).rejects.toThrow();
    });
  });
});