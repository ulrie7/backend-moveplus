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
jest.mock('../../resources/trajet.resources', () => ({
  collection: jest.fn((item) => item),
  ref: jest.fn((item) => item),
}));

const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

describe('TrajetServices', () => {
  let mongoServer;
  let TrajetServices;
  let trajetServices;
  let Trajet;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());

    // Register referenced model schemas for populate support
    if (!mongoose.modelNames().includes('Vehicle')) mongoose.model('Vehicle', new mongoose.Schema({}, { strict: false }));

    Trajet = require('../../models/trajet.model');
    TrajetServices = require('../../services/trajet.services');
    trajetServices = new TrajetServices();
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    await mongoServer.stop();
  });

  afterEach(async () => {
    await Trajet.deleteMany({});
  });

  describe('create', () => {
    it('should create a trajet with valid data', async () => {
      const payload = {
        date_start: '2024-01-15',
        date_end: '2024-01-15',
        stop_time: 42,
        stop_nb: 42,
        status: 'active',
      };

      const result = await trajetServices.create(payload);
      expect(result).toBeDefined();
      expect(result.date_start).toBeDefined();
      expect(result.date_end).toBeDefined();
      expect(result.stop_time).toBe(42);
    });


  });

  describe('delete', () => {
    it('should soft delete a trajet', async () => {
      const trajet = await Trajet.create({
        date_start: '2024-01-15',
        date_end: '2024-01-15',
        stop_time: 42,
        stop_nb: 42,
        status: 'active',
      });

      await trajetServices.delete({ _id: trajet._id });

      const found = await Trajet.findById(trajet._id);
      expect(found).toBeNull();
    });

    it('should throw NotFoundError if trajet does not exist', async () => {
      await expect(
        trajetServices.delete({ _id: new mongoose.Types.ObjectId() })
      ).rejects.toThrow();
    });

  });

  describe('update', () => {
    it('should update trajet fields', async () => {
      const trajet = await Trajet.create({
        date_start: '2024-01-15',
        date_end: '2024-01-15',
        stop_time: 42,
        stop_nb: 42,
        status: 'active',
      });

      const updated = await trajetServices.update(
        { _id: trajet._id },
        {
        date_start: '2025-12-31',
        date_end: '2025-12-31',
        stop_time: 99999,
        }
      );
      expect(updated.date_start).toBe('2025-12-31');
      expect(updated.date_end).toBe('2025-12-31');
      expect(updated.stop_time).toBe(99999);
    });

    it('should throw NotFoundError if trajet does not exist', async () => {
      await expect(
        trajetServices.update(
          { _id: new mongoose.Types.ObjectId() },
          { date_start: '2025-12-31' }
        )
      ).rejects.toThrow();
    });

  });
});