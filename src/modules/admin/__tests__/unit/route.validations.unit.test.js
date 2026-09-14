const RouteValidations = require('../../validations/route.validations');

describe('RouteValidations', () => {
  describe('CreateValidation', () => {
    it('should pass with valid complete data', () => {
      const { error } = RouteValidations.CreateValidation({
        date_start: '2024-01-15',
        date_end: '2024-01-15',
        stop_time: 42,
        stop_nb: 42,
        status: 'active',
        distance: 42,
        average_speed: 25,
        max_speed: 42,
      });
      expect(error).toBeUndefined();
    });

    it('should pass with empty object (all fields optional)', () => {
      const { error } = RouteValidations.CreateValidation({});
      expect(error).toBeUndefined();
    });


    it('should fail when date_start has invalid type', () => {
      const { error } = RouteValidations.CreateValidation({
        date_start: 'not-a-date',
      });
      expect(error).toBeDefined();
      expect(error.details[0].path).toContain('date_start');
    });

    it('should fail when date_end has invalid type', () => {
      const { error } = RouteValidations.CreateValidation({
        date_end: 'not-a-date',
      });
      expect(error).toBeDefined();
      expect(error.details[0].path).toContain('date_end');
    });

    it('should fail when stop_time has invalid type', () => {
      const { error } = RouteValidations.CreateValidation({
        stop_time: 'not-a-number',
      });
      expect(error).toBeDefined();
      expect(error.details[0].path).toContain('stop_time');
    });

    it('should fail when stop_nb has invalid type', () => {
      const { error } = RouteValidations.CreateValidation({
        stop_nb: 'not-a-number',
      });
      expect(error).toBeDefined();
      expect(error.details[0].path).toContain('stop_nb');
    });

    it('should fail when distance has invalid type', () => {
      const { error } = RouteValidations.CreateValidation({
        distance: 'not-a-number',
      });
      expect(error).toBeDefined();
      expect(error.details[0].path).toContain('distance');
    });

    it('should fail when average_speed has invalid type', () => {
      const { error } = RouteValidations.CreateValidation({
        average_speed: 'not-a-number',
      });
      expect(error).toBeDefined();
      expect(error.details[0].path).toContain('average_speed');
    });

    it('should fail when max_speed has invalid type', () => {
      const { error } = RouteValidations.CreateValidation({
        max_speed: 'not-a-number',
      });
      expect(error).toBeDefined();
      expect(error.details[0].path).toContain('max_speed');
    });


    it('should allow null values for optional fields', () => {
      const { error } = RouteValidations.CreateValidation({
        date_start: null,
        date_end: null,
        stop_time: null,
      });
      expect(error).toBeUndefined();
    });

    it('should reject unknown fields', () => {
      const { error } = RouteValidations.CreateValidation({
        unknownField: 'value',
      });
      expect(error).toBeDefined();
    });
  });

  describe('UpdateValidation', () => {
    it('should pass with partial data', () => {
      const { error } = RouteValidations.UpdateValidation({
        date_start: '2025-12-31',
      });
      expect(error).toBeUndefined();
    });

    it('should pass with empty object', () => {
      const { error } = RouteValidations.UpdateValidation({});
      expect(error).toBeUndefined();
    });

    it('should fail when date_start has invalid type', () => {
      const { error } = RouteValidations.UpdateValidation({
        date_start: 'not-a-date',
      });
      expect(error).toBeDefined();
    });

    it('should fail when date_end has invalid type', () => {
      const { error } = RouteValidations.UpdateValidation({
        date_end: 'not-a-date',
      });
      expect(error).toBeDefined();
    });

    it('should fail when stop_time has invalid type', () => {
      const { error } = RouteValidations.UpdateValidation({
        stop_time: 'not-a-number',
      });
      expect(error).toBeDefined();
    });

  });
});