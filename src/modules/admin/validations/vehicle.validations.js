/**
 * @VehicleValidations 
 */

const Joi = require("@hapi/joi");
module.exports = class VehicleValidations {

  constructor() {

  }
  /**
   * CreateValidation 
   */
  static CreateValidation(data) {
    const validationSchema = {
      immatriculation: Joi.string().allow('').allow(null),
      type_vehicule: Joi.string().allow('').allow(null),
      brand: Joi.string().allow('').allow(null),
      modele: Joi.string().allow('').allow(null),
      color: Joi.string().allow('').allow(null),
      year: Joi.string().allow('').allow(null),
      status: Joi.string().allow('').allow(null),
      gps_id: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).allow('').allow(null),
      coordinates: Joi.string()
        .pattern(/^\s*\{\s*"lat":\s*-?\d+(\.\d+)?\s*,\s*"lng":\s*-?\d+(\.\d+)?\s*\}\s*$/)
        .allow('')
        .allow(null),
    }


    const schema = Joi.object(validationSchema);

    return schema.validate(data);
  }
  /**
   * UpdateValidation 
   */
  static UpdateValidation(data) {
    const validationSchema = {
      immatriculation: Joi.string().allow('').allow(null),
      type_vehicule: Joi.string().allow('').allow(null),
      brand: Joi.string().allow('').allow(null),
      modele: Joi.string().allow('').allow(null),
      color: Joi.string().allow('').allow(null),
      year: Joi.string().allow('').allow(null),
      status: Joi.string().allow('').allow(null),
      gps_id: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).allow('').allow(null),
      coordinates: Joi.string()
        .pattern(/^\s*\{\s*"lat":\s*-?\d+(\.\d+)?\s*,\s*"lng":\s*-?\d+(\.\d+)?\s*\}\s*$/)
        .allow('')
        .allow(null),
    }


    const schema = Joi.object(validationSchema);

    return schema.validate(data);
  }

}