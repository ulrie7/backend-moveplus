const GPSValidations = require('../../validations/gps.validations');

describe('GPSValidations', () => {
  describe('CreateValidation', () => {
    it('should pass with valid complete data', () => {
      const { error } = GPSValidations.CreateValidation({
        imei: 'Test Imei',
        status: 'active',
        battery: 42,
        brand: 'Test Brand',
        last_connexion: '2024-01-15',
        model_device: 'Test Model_device',
      });
      expect(error).toBeUndefined();
    });

    it('should pass with empty object (all fields optional)', () => {
      const { error } = GPSValidations.CreateValidation({});
      expect(error).toBeUndefined();
    });


    it('should fail when battery has invalid type', () => {
      const { error } = GPSValidations.CreateValidation({
        battery: 'not-a-number',
      });
      expect(error).toBeDefined();
      expect(error.details[0].path).toContain('battery');
    });

    it('should fail when last_connexion has invalid type', () => {
      const { error } = GPSValidations.CreateValidation({
        last_connexion: 'not-a-date',
      });
      expect(error).toBeDefined();
      expect(error.details[0].path).toContain('last_connexion');
    });


    it('should allow null values for optional fields', () => {
      const { error } = GPSValidations.CreateValidation({
        imei: null,
        status: null,
        battery: null,
      });
      expect(error).toBeUndefined();
    });

    it('should reject unknown fields', () => {
      const { error } = GPSValidations.CreateValidation({
        unknownField: 'value',
      });
      expect(error).toBeDefined();
    });
  });

  describe('UpdateValidation', () => {
    it('should pass with partial data', () => {
      const { error } = GPSValidations.UpdateValidation({
        imei: 'Updated Imei',
      });
      expect(error).toBeUndefined();
    });

    it('should pass with empty object', () => {
      const { error } = GPSValidations.UpdateValidation({});
      expect(error).toBeUndefined();
    });

    it('should fail when battery has invalid type', () => {
      const { error } = GPSValidations.UpdateValidation({
        battery: 'not-a-number',
      });
      expect(error).toBeDefined();
    });

    it('should fail when last_connexion has invalid type', () => {
      const { error } = GPSValidations.UpdateValidation({
        last_connexion: 'not-a-date',
      });
      expect(error).toBeDefined();
    });

  });
});