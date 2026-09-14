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
jest.mock('../../resources/gps.resources', () => ({
  collection: jest.fn((item) => item),
  ref: jest.fn((item) => item),
}));

const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

describe('GPSServices', () => {
  let mongoServer;
  let GPSServices;
  let gPSServices;
  let GPS;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());

    // Register referenced model schemas for populate support
    if (!mongoose.modelNames().includes('Vehicle')) mongoose.model('Vehicle', new mongoose.Schema({}, { strict: false }));

    GPS = require('../../models/gps.model');
    GPSServices = require('../../services/gps.services');
    gPSServices = new GPSServices();
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    await mongoServer.stop();
  });

  afterEach(async () => {
    await GPS.deleteMany({});
  });

  describe('create', () => {
    it('should create a gps with valid data', async () => {
      const payload = {
        imei: 'Test Imei',
        status: 'active',
        battery: 42,
        brand: 'Test Brand',
        last_connexion: '2024-01-15',
      };

      const result = await gPSServices.create(payload);
      expect(result).toBeDefined();
      expect(result.imei).toBe('Test Imei');
      expect(result.status).toBe('active');
      expect(result.battery).toBe(42);
    });


  });

  describe('delete', () => {
    it('should soft delete a gps', async () => {
      const gPS = await GPS.create({
        imei: 'Test Imei',
        status: 'active',
        battery: 42,
        brand: 'Test Brand',
        last_connexion: '2024-01-15',
      });

      await gPSServices.delete({ _id: gPS._id });

      const found = await GPS.findById(gPS._id);
      expect(found).toBeNull();
    });

    it('should throw NotFoundError if gps does not exist', async () => {
      await expect(
        gPSServices.delete({ _id: new mongoose.Types.ObjectId() })
      ).rejects.toThrow();
    });

  });

  describe('update', () => {
    it('should update gps fields', async () => {
      const gPS = await GPS.create({
        imei: 'Test Imei',
        status: 'active',
        battery: 42,
        brand: 'Test Brand',
        last_connexion: '2024-01-15',
      });

      const updated = await gPSServices.update(
        { _id: gPS._id },
        {
        imei: 'Updated Imei',
        status: 'Updated Status',
        battery: 99999,
        }
      );
      expect(updated.imei).toBe('Updated Imei');
      expect(updated.status).toBe('Updated Status');
      expect(updated.battery).toBe(99999);
    });

    it('should throw NotFoundError if gps does not exist', async () => {
      await expect(
        gPSServices.update(
          { _id: new mongoose.Types.ObjectId() },
          { imei: 'Updated Imei' }
        )
      ).rejects.toThrow();
    });

  });
});