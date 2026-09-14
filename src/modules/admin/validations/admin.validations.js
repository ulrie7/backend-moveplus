/**
 * @AdminValidations 
 */

const Joi = require("@hapi/joi");
module.exports = class AdminValidations {

  constructor() {

  }
  /**
   * CreateValidation 
   */
  static CreateValidation(data) {
    const validationSchema = {
      firstName: Joi.string().allow('').allow(null),
      lastName: Joi.string().allow('').allow(null),
      email: Joi.string().allow('').allow(null),
      roles: Joi.array().required(),
    }

    validationSchema.password = Joi.string().required()

    const schema = Joi.object(validationSchema);

    return schema.validate(data);
  }
  /**
   * UpdateValidation 
   */
  static UpdateValidation(data) {
    const validationSchema = {
      firstName: Joi.string().allow('').allow(null),
      lastName: Joi.string().allow('').allow(null),
      email: Joi.string().allow('').allow(null),
      roles: Joi.array().allow('').allow(null),
    }


    const schema = Joi.object(validationSchema);

    return schema.validate(data);
  }

}