const VehicleValidations = require('../../validations/vehicle.validations');

describe('VehicleValidations', () => {
  describe('CreateValidation', () => {
    it('should pass with valid complete data', () => {
      const { error } = VehicleValidations.CreateValidation({
        immatriculation: 'Test Immatriculation',
        type_vehicule: 'Test Type_vehicule',
        brand: 'Test Brand',
        modele: 'Test Modele',
        color: '#FF5733',
        year: '2024',
        status: 'active',
      });
      expect(error).toBeUndefined();
    });

    it('should pass with empty object (all fields optional)', () => {
      const { error } = VehicleValidations.CreateValidation({});
      expect(error).toBeUndefined();
    });




    it('should allow null values for optional fields', () => {
      const { error } = VehicleValidations.CreateValidation({
        immatriculation: null,
        type_vehicule: null,
        brand: null,
      });
      expect(error).toBeUndefined();
    });

    it('should reject unknown fields', () => {
      const { error } = VehicleValidations.CreateValidation({
        unknownField: 'value',
      });
      expect(error).toBeDefined();
    });
  });

  describe('UpdateValidation', () => {
    it('should pass with partial data', () => {
      const { error } = VehicleValidations.UpdateValidation({
        immatriculation: 'Updated Immatriculation',
      });
      expect(error).toBeUndefined();
    });

    it('should pass with empty object', () => {
      const { error } = VehicleValidations.UpdateValidation({});
      expect(error).toBeUndefined();
    });


  });
});