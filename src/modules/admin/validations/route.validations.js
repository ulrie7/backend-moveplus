/**
 * @RouteValidations 
 */

const Joi = require("@hapi/joi");
module.exports = class RouteValidations {

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
      date_start: Joi.date().required(),
      date_end: Joi.date().required(),
      stop_time: Joi.number().required(),
      stop_nb: Joi.number().required(),
      status: Joi.string().required(),
      vehicle_id: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required(),
      distance: Joi.number().required(),
      average_speed: Joi.number().required(),
      max_speed: Joi.number().required(),
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
      date_start: Joi.date().allow('').allow(null),
      date_end: Joi.date().allow('').allow(null),
      stop_time: Joi.number().allow('').allow(null),
      stop_nb: Joi.number().allow('').allow(null),
      status: Joi.string().allow('').allow(null),
      vehicle_id: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).allow('').allow(null),
      distance: Joi.number().allow('').allow(null),
      average_speed: Joi.number().allow('').allow(null),
      max_speed: Joi.number().allow('').allow(null),
    }


    const schema = Joi.object(validationSchema);

    return schema.validate(data);
  }

}