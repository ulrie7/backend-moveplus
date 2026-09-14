/**
 * @AlertValidations 
 */

const Joi = require("@hapi/joi");
module.exports = class AlertValidations {

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
      gps_id: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).allow('').allow(null),
      alert_type: Joi.string().allow('').allow(null),
      seuil: Joi.string().allow('').allow(null),
      date_generation: Joi.date().allow('').allow(null),
      status: Joi.string().allow('').allow(null),
      message: Joi.string().allow('').allow(null),
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
      gps_id: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).allow('').allow(null),
      alert_type: Joi.string().allow('').allow(null),
      seuil: Joi.string().allow('').allow(null),
      date_generation: Joi.date().allow('').allow(null),
      status: Joi.string().allow('').allow(null),
      message: Joi.string().allow('').allow(null),
    }


    const schema = Joi.object(validationSchema);

    return schema.validate(data);
  }

}