const GeofenceValidations = require('../../validations/geofence.validations');

describe('GeofenceValidations', () => {
  describe('CreateValidation', () => {
    it('should pass with valid complete data', () => {
      const { error } = GeofenceValidations.CreateValidation({
        zone_name: 'Test Zone_name',
        type_zone: 'Test Type_zone',
        coordinates: 'Test Coordinates',
        perimeter: 42,
        statut: true,
      });
      expect(error).toBeUndefined();
    });

    it('should pass with empty object (all fields optional)', () => {
      const { error } = GeofenceValidations.CreateValidation({});
      expect(error).toBeUndefined();
    });


    it('should fail when perimeter has invalid type', () => {
      const { error } = GeofenceValidations.CreateValidation({
        perimeter: 'not-a-number',
      });
      expect(error).toBeDefined();
      expect(error.details[0].path).toContain('perimeter');
    });

    it('should fail when statut has invalid type', () => {
      const { error } = GeofenceValidations.CreateValidation({
        statut: 'not-a-boolean',
      });
      expect(error).toBeDefined();
      expect(error.details[0].path).toContain('statut');
    });


    it('should allow null values for optional fields', () => {
      const { error } = GeofenceValidations.CreateValidation({
        zone_name: null,
        type_zone: null,
        coordinates: null,
      });
      expect(error).toBeUndefined();
    });

    it('should reject unknown fields', () => {
      const { error } = GeofenceValidations.CreateValidation({
        unknownField: 'value',
      });
      expect(error).toBeDefined();
    });
  });

  describe('UpdateValidation', () => {
    it('should pass with partial data', () => {
      const { error } = GeofenceValidations.UpdateValidation({
        zone_name: 'Updated Zone_name',
      });
      expect(error).toBeUndefined();
    });

    it('should pass with empty object', () => {
      const { error } = GeofenceValidations.UpdateValidation({});
      expect(error).toBeUndefined();
    });

    it('should fail when perimeter has invalid type', () => {
      const { error } = GeofenceValidations.UpdateValidation({
        perimeter: 'not-a-number',
      });
      expect(error).toBeDefined();
    });

  });
});