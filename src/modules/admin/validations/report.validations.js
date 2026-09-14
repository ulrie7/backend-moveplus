/**
 * @ReportValidations 
 */

const Joi = require("@hapi/joi");
module.exports = class ReportValidations {

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
      id_admin: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).allow('').allow(null),
      id_vehicule: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).allow('').allow(null),
      report_type: Joi.string().allow('').allow(null),
      date_generation: Joi.date().allow('').allow(null),
      periode_debut: Joi.date().allow('').allow(null),
      periode_fin: Joi.date().allow('').allow(null),
      statut: Joi.date().allow('').allow(null),
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
      id_admin: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).allow('').allow(null),
      id_vehicule: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).allow('').allow(null),
      report_type: Joi.string().allow('').allow(null),
      date_generation: Joi.date().allow('').allow(null),
      periode_debut: Joi.date().allow('').allow(null),
      periode_fin: Joi.date().allow('').allow(null),
      statut: Joi.date().allow('').allow(null),
    }


    const schema = Joi.object(validationSchema);

    return schema.validate(data);
  }

}