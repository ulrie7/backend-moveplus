/**
 * @GeofenceValidations 
 */

const Joi = require("@hapi/joi");
module.exports = class GeofenceValidations {

  constructor() {

  }
  /**
   * CreateValidation 
   */
  static CreateValidation(data) {
    const validationSchema = {
      createdBy: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).allow('').allow(null),
      updatedBy: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).allow('').allow(null),
      deletedBy: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).allow('').allow(null),
      zone_name: Joi.string().allow('').allow(null),
      type_zone: Joi.string().allow('').allow(null),
      coordinates: Joi.string().allow('').allow(null),
      perimeter: Joi.number().allow('').allow(null),
      statut: Joi.boolean().allow('').allow(null),
      vehicle_id: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).allow('').allow(null),
    }


    const schema = Joi.object(validationSchema);

    return schema.validate(data);
  }
  /**
   * UpdateValidation 
   */
  static UpdateValidation(data) {
    const validationSchema = {
      createdBy: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).allow('').allow(null),
      updatedBy: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).allow('').allow(null),
      deletedBy: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).allow('').allow(null),
      zone_name: Joi.string().allow('').allow(null),
      type_zone: Joi.string().allow('').allow(null),
      coordinates: Joi.string().allow('').allow(null),
      perimeter: Joi.number().allow('').allow(null),
      statut: Joi.boolean().allow('').allow(null),
      vehicle_id: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).allow('').allow(null),
    }


    const schema = Joi.object(validationSchema);

    return schema.validate(data);
  }

}