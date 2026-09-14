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
jest.mock('../../resources/vehicle.resources', () => ({
  collection: jest.fn((item) => item),
  ref: jest.fn((item) => item),
}));

const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

describe('VehicleServices', () => {
  let mongoServer;
  let VehicleServices;
  let vehicleServices;
  let Vehicle;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());

    // Register referenced model schemas for populate support
    if (!mongoose.modelNames().includes('GPS')) mongoose.model('GPS', new mongoose.Schema({}, { strict: false }));

    Vehicle = require('../../models/vehicle.model');
    VehicleServices = require('../../services/vehicle.services');
    vehicleServices = new VehicleServices();
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    await mongoServer.stop();
  });

  afterEach(async () => {
    await Vehicle.deleteMany({});
  });

  describe('create', () => {
    it('should create a vehicle with valid data', async () => {
      const payload = {
        immatriculation: 'Test Immatriculation',
        type_vehicule: 'Test Type_vehicule',
        brand: 'Test Brand',
        modele: 'Test Modele',
        color: '#FF5733',
      };

      const result = await vehicleServices.create(payload);
      expect(result).toBeDefined();
      expect(result.immatriculation).toBe('Test Immatriculation');
      expect(result.type_vehicule).toBe('Test Type_vehicule');
      expect(result.brand).toBe('Test Brand');
    });


  });

  describe('delete', () => {
    it('should soft delete a vehicle', async () => {
      const vehicle = await Vehicle.create({
        immatriculation: 'Test Immatriculation',
        type_vehicule: 'Test Type_vehicule',
        brand: 'Test Brand',
        modele: 'Test Modele',
        color: '#FF5733',
      });

      await vehicleServices.delete({ _id: vehicle._id });

      const found = await Vehicle.findById(vehicle._id);
      expect(found).toBeNull();
    });

    it('should throw NotFoundError if vehicle does not exist', async () => {
      await expect(
        vehicleServices.delete({ _id: new mongoose.Types.ObjectId() })
      ).rejects.toThrow();
    });

  });

  describe('update', () => {
    it('should update vehicle fields', async () => {
      const vehicle = await Vehicle.create({
        immatriculation: 'Test Immatriculation',
        type_vehicule: 'Test Type_vehicule',
        brand: 'Test Brand',
        modele: 'Test Modele',
        color: '#FF5733',
      });

      const updated = await vehicleServices.update(
        { _id: vehicle._id },
        {
        immatriculation: 'Updated Immatriculation',
        type_vehicule: 'Updated Type_vehicule',
        brand: 'Updated Brand',
        }
      );
      expect(updated.immatriculation).toBe('Updated Immatriculation');
      expect(updated.type_vehicule).toBe('Updated Type_vehicule');
      expect(updated.brand).toBe('Updated Brand');
    });

    it('should throw NotFoundError if vehicle does not exist', async () => {
      await expect(
        vehicleServices.update(
          { _id: new mongoose.Types.ObjectId() },
          { immatriculation: 'Updated Immatriculation' }
        )
      ).rejects.toThrow();
    });

  });
});