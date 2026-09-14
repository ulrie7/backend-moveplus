/**
 * @GPSValidations 
 */

const Joi = require("@hapi/joi");
module.exports = class GPSValidations {

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
      imei: Joi.string().allow('').allow(null),
      status: Joi.string().allow('').allow(null),
      battery: Joi.number().allow('').allow(null),
      brand: Joi.string().allow('').allow(null),
      last_connexion: Joi.date().allow('').allow(null),
      model_device: Joi.string().allow('').allow(null),
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
      imei: Joi.string().allow('').allow(null),
      status: Joi.string().allow('').allow(null),
      battery: Joi.number().allow('').allow(null),
      brand: Joi.string().allow('').allow(null),
      last_connexion: Joi.date().allow('').allow(null),
      model_device: Joi.string().allow('').allow(null),
      vehicle_id: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).allow('').allow(null),
    }


    const schema = Joi.object(validationSchema);

    return schema.validate(data);
  }

}