const AlertValidations = require('../../validations/alert.validations');

describe('AlertValidations', () => {
  describe('CreateValidation', () => {
    it('should pass with valid complete data', () => {
      const { error } = AlertValidations.CreateValidation({
        alert_type: 'Test Alert_type',
        seuil: 'Test Seuil',
        date_generation: '2024-01-15',
        status: 'active',
        message: 'Test Message',
      });
      expect(error).toBeUndefined();
    });

    it('should pass with empty object (all fields optional)', () => {
      const { error } = AlertValidations.CreateValidation({});
      expect(error).toBeUndefined();
    });


    it('should fail when date_generation has invalid type', () => {
      const { error } = AlertValidations.CreateValidation({
        date_generation: 'not-a-date',
      });
      expect(error).toBeDefined();
      expect(error.details[0].path).toContain('date_generation');
    });


    it('should allow null values for optional fields', () => {
      const { error } = AlertValidations.CreateValidation({
        alert_type: null,
        seuil: null,
        date_generation: null,
      });
      expect(error).toBeUndefined();
    });

    it('should reject unknown fields', () => {
      const { error } = AlertValidations.CreateValidation({
        unknownField: 'value',
      });
      expect(error).toBeDefined();
    });
  });

  describe('UpdateValidation', () => {
    it('should pass with partial data', () => {
      const { error } = AlertValidations.UpdateValidation({
        alert_type: 'Updated Alert_type',
      });
      expect(error).toBeUndefined();
    });

    it('should pass with empty object', () => {
      const { error } = AlertValidations.UpdateValidation({});
      expect(error).toBeUndefined();
    });

    it('should fail when date_generation has invalid type', () => {
      const { error } = AlertValidations.UpdateValidation({
        date_generation: 'not-a-date',
      });
      expect(error).toBeDefined();
    });

  });
});