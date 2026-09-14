const ReportValidations = require('../../validations/report.validations');

describe('ReportValidations', () => {
  describe('CreateValidation', () => {
    it('should pass with valid complete data', () => {
      const { error } = ReportValidations.CreateValidation({
        report_type: 'Test Report_type',
        date_generation: '2024-01-15',
        periode_debut: '2024-01-15',
        periode_fin: '2024-01-15',
        statut: '2024-01-15',
      });
      expect(error).toBeUndefined();
    });

    it('should pass with empty object (all fields optional)', () => {
      const { error } = ReportValidations.CreateValidation({});
      expect(error).toBeUndefined();
    });


    it('should fail when date_generation has invalid type', () => {
      const { error } = ReportValidations.CreateValidation({
        date_generation: 'not-a-date',
      });
      expect(error).toBeDefined();
      expect(error.details[0].path).toContain('date_generation');
    });

    it('should fail when periode_debut has invalid type', () => {
      const { error } = ReportValidations.CreateValidation({
        periode_debut: 'not-a-date',
      });
      expect(error).toBeDefined();
      expect(error.details[0].path).toContain('periode_debut');
    });

    it('should fail when periode_fin has invalid type', () => {
      const { error } = ReportValidations.CreateValidation({
        periode_fin: 'not-a-date',
      });
      expect(error).toBeDefined();
      expect(error.details[0].path).toContain('periode_fin');
    });

    it('should fail when statut has invalid type', () => {
      const { error } = ReportValidations.CreateValidation({
        statut: 'not-a-date',
      });
      expect(error).toBeDefined();
      expect(error.details[0].path).toContain('statut');
    });


    it('should allow null values for optional fields', () => {
      const { error } = ReportValidations.CreateValidation({
        report_type: null,
        date_generation: null,
        periode_debut: null,
      });
      expect(error).toBeUndefined();
    });

    it('should reject unknown fields', () => {
      const { error } = ReportValidations.CreateValidation({
        unknownField: 'value',
      });
      expect(error).toBeDefined();
    });
  });

  describe('UpdateValidation', () => {
    it('should pass with partial data', () => {
      const { error } = ReportValidations.UpdateValidation({
        report_type: 'Updated Report_type',
      });
      expect(error).toBeUndefined();
    });

    it('should pass with empty object', () => {
      const { error } = ReportValidations.UpdateValidation({});
      expect(error).toBeUndefined();
    });

    it('should fail when date_generation has invalid type', () => {
      const { error } = ReportValidations.UpdateValidation({
        date_generation: 'not-a-date',
      });
      expect(error).toBeDefined();
    });

    it('should fail when periode_debut has invalid type', () => {
      const { error } = ReportValidations.UpdateValidation({
        periode_debut: 'not-a-date',
      });
      expect(error).toBeDefined();
    });

    it('should fail when periode_fin has invalid type', () => {
      const { error } = ReportValidations.UpdateValidation({
        periode_fin: 'not-a-date',
      });
      expect(error).toBeDefined();
    });

  });
});