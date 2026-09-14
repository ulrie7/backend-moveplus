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
jest.mock('../../resources/report.resources', () => ({
  collection: jest.fn((item) => item),
  ref: jest.fn((item) => item),
}));

const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

describe('ReportServices', () => {
  let mongoServer;
  let ReportServices;
  let reportServices;
  let Report;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());

    // Register referenced model schemas for populate support
    if (!mongoose.modelNames().includes('Admin')) mongoose.model('Admin', new mongoose.Schema({}, { strict: false }));
    if (!mongoose.modelNames().includes('Vehicle')) mongoose.model('Vehicle', new mongoose.Schema({}, { strict: false }));

    Report = require('../../models/report.model');
    ReportServices = require('../../services/report.services');
    reportServices = new ReportServices();
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    await mongoServer.stop();
  });

  afterEach(async () => {
    await Report.deleteMany({});
  });

  describe('create', () => {
    it('should create a report with valid data', async () => {
      const payload = {
        report_type: 'Test Report_type',
        date_generation: '2024-01-15',
        periode_debut: '2024-01-15',
        periode_fin: '2024-01-15',
        statut: '2024-01-15',
      };

      const result = await reportServices.create(payload);
      expect(result).toBeDefined();
      expect(result.report_type).toBe('Test Report_type');
      expect(result.date_generation).toBeDefined();
      expect(result.periode_debut).toBeDefined();
    });


  });

  describe('delete', () => {
    it('should soft delete a report', async () => {
      const report = await Report.create({
        report_type: 'Test Report_type',
        date_generation: '2024-01-15',
        periode_debut: '2024-01-15',
        periode_fin: '2024-01-15',
        statut: '2024-01-15',
      });

      await reportServices.delete({ _id: report._id });

      const found = await Report.findById(report._id);
      expect(found).toBeNull();
    });

    it('should throw NotFoundError if report does not exist', async () => {
      await expect(
        reportServices.delete({ _id: new mongoose.Types.ObjectId() })
      ).rejects.toThrow();
    });

  });

  describe('update', () => {
    it('should update report fields', async () => {
      const report = await Report.create({
        report_type: 'Test Report_type',
        date_generation: '2024-01-15',
        periode_debut: '2024-01-15',
        periode_fin: '2024-01-15',
        statut: '2024-01-15',
      });

      const updated = await reportServices.update(
        { _id: report._id },
        {
        report_type: 'Updated Report_type',
        date_generation: '2025-12-31',
        periode_debut: '2025-12-31',
        }
      );
      expect(updated.report_type).toBe('Updated Report_type');
      expect(updated.date_generation).toBe('2025-12-31');
      expect(updated.periode_debut).toBe('2025-12-31');
    });

    it('should throw NotFoundError if report does not exist', async () => {
      await expect(
        reportServices.update(
          { _id: new mongoose.Types.ObjectId() },
          { report_type: 'Updated Report_type' }
        )
      ).rejects.toThrow();
    });

  });
});