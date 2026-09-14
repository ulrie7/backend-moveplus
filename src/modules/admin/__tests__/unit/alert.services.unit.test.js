// Mock all CoreServices dependencies
jest.mock('../../../../config/logger/winston.logger', () => ({
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
}));
jest.mock('../../../../shared/services/email.services', () => ({
  sendEmail: jest.fn().mockResolvedValue(true),
}));
jest.mock('../../../../shared/services/sms.services', () => jest.fn());
jest.mock('../../../../shared/services/whatsapp.services', () => jest.fn());
jest.mock('../../../../shared/lib/message_dispatcher', () => jest.fn());
jest.mock('../../../../shared/lib/session_manager', () => ({
  executeQueryHookWithSession: jest.fn((query) => query),
  executeCallbackInTransaction: jest.fn((cb) => cb(null)),
}));
jest.mock('../../resources/alert.resources', () => ({
  collection: jest.fn((item) => item),
  ref: jest.fn((item) => item),
}));

const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

describe('AlertServices', () => {
  let mongoServer;
  let AlertServices;
  let alertServices;
  let Alert;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());

    // Register referenced model schemas for populate support
    if (!mongoose.modelNames().includes('GPS')) mongoose.model('GPS', new mongoose.Schema({}, { strict: false }));

    Alert = require('../../models/alert.model');
    AlertServices = require('../../services/alert.services');
    alertServices = new AlertServices();
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    await mongoServer.stop();
  });

  afterEach(async () => {
    await Alert.deleteMany({});
  });

  describe('create', () => {
    it('should create a alert with valid data', async () => {
      const payload = {
        alert_type: 'Test Alert_type',
        seuil: 'Test Seuil',
        date_generation: '2024-01-15',
        status: 'active',
        message: 'Test Message',
      };

      const result = await alertServices.create(payload);
      expect(result).toBeDefined();
      expect(result.alert_type).toBe('Test Alert_type');
      expect(result.seuil).toBe('Test Seuil');
      expect(result.date_generation).toBeDefined();
    });


  });

  describe('delete', () => {
    it('should soft delete a alert', async () => {
      const alert = await Alert.create({
        alert_type: 'Test Alert_type',
        seuil: 'Test Seuil',
        date_generation: '2024-01-15',
        status: 'active',
        message: 'Test Message',
      });

      await alertServices.delete({ _id: alert._id });

      const found = await Alert.findById(alert._id);
      expect(found).toBeNull();
    });

    it('should throw NotFoundError if alert does not exist', async () => {
      await expect(
        alertServices.delete({ _id: new mongoose.Types.ObjectId() })
      ).rejects.toThrow();
    });

  });

  describe('update', () => {
    it('should update alert fields', async () => {
      const alert = await Alert.create({
        alert_type: 'Test Alert_type',
        seuil: 'Test Seuil',
        date_generation: '2024-01-15',
        status: 'active',
        message: 'Test Message',
      });

      const updated = await alertServices.update(
        { _id: alert._id },
        {
        alert_type: 'Updated Alert_type',
        seuil: 'Updated Seuil',
        date_generation: '2025-12-31',
        }
      );
      expect(updated.alert_type).toBe('Updated Alert_type');
      expect(updated.seuil).toBe('Updated Seuil');
      expect(updated.date_generation).toBe('2025-12-31');
    });

    it('should throw NotFoundError if alert does not exist', async () => {
      await expect(
        alertServices.update(
          { _id: new mongoose.Types.ObjectId() },
          { alert_type: 'Updated Alert_type' }
        )
      ).rejects.toThrow();
    });

  });
});