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
jest.mock('../../resources/geofence.resources', () => ({
  collection: jest.fn((item) => item),
  ref: jest.fn((item) => item),
}));

const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

describe('GeofenceServices', () => {
  let mongoServer;
  let GeofenceServices;
  let geofenceServices;
  let Geofence;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());

    // Register referenced model schemas for populate support
    if (!mongoose.modelNames().includes('Vehicle')) mongoose.model('Vehicle', new mongoose.Schema({}, { strict: false }));

    Geofence = require('../../models/geofence.model');
    GeofenceServices = require('../../services/geofence.services');
    geofenceServices = new GeofenceServices();
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    await mongoServer.stop();
  });

  afterEach(async () => {
    await Geofence.deleteMany({});
  });

  describe('create', () => {
    it('should create a geofence with valid data', async () => {
      const payload = {
        zone_name: 'Test Zone_name',
        type_zone: 'Test Type_zone',
        coordinates: 'Test Coordinates',
        perimeter: 42,
        statut: true,
      };

      const result = await geofenceServices.create(payload);
      expect(result).toBeDefined();
      expect(result.zone_name).toBe('Test Zone_name');
      expect(result.type_zone).toBe('Test Type_zone');
      expect(result.coordinates).toBe('Test Coordinates');
    });


  });

  describe('delete', () => {
    it('should soft delete a geofence', async () => {
      const geofence = await Geofence.create({
        zone_name: 'Test Zone_name',
        type_zone: 'Test Type_zone',
        coordinates: 'Test Coordinates',
        perimeter: 42,
        statut: true,
      });

      await geofenceServices.delete({ _id: geofence._id });

      const found = await Geofence.findById(geofence._id);
      expect(found).toBeNull();
    });

    it('should throw NotFoundError if geofence does not exist', async () => {
      await expect(
        geofenceServices.delete({ _id: new mongoose.Types.ObjectId() })
      ).rejects.toThrow();
    });

  });

  describe('update', () => {
    it('should update geofence fields', async () => {
      const geofence = await Geofence.create({
        zone_name: 'Test Zone_name',
        type_zone: 'Test Type_zone',
        coordinates: 'Test Coordinates',
        perimeter: 42,
        statut: true,
      });

      const updated = await geofenceServices.update(
        { _id: geofence._id },
        {
        zone_name: 'Updated Zone_name',
        type_zone: 'Updated Type_zone',
        coordinates: 'Updated Coordinates',
        }
      );
      expect(updated.zone_name).toBe('Updated Zone_name');
      expect(updated.type_zone).toBe('Updated Type_zone');
      expect(updated.coordinates).toBe('Updated Coordinates');
    });

    it('should throw NotFoundError if geofence does not exist', async () => {
      await expect(
        geofenceServices.update(
          { _id: new mongoose.Types.ObjectId() },
          { zone_name: 'Updated Zone_name' }
        )
      ).rejects.toThrow();
    });

  });
});