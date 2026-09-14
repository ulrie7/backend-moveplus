/**
 * @AdminAuthValidation 
 */

const Joi = require("@hapi/joi");
module.exports = class AdminAuthValidations {

  constructor() {

  }
  /**
   * VerifyAccount 
   */
  static VerifyAccount(data) {
    const validationSchema = {
      email: Joi.string().required(),
      code: Joi.string().required(),

    }
    const schema = Joi.object(validationSchema);

    return schema.validate(data);
  }
  /**
   * ResendAccountVerificationCode 
   */
  static ResendAccountVerificationCode(data) {
    const validationSchema = {
      email: Joi.string().required(),

    }
    const schema = Joi.object(validationSchema);

    return schema.validate(data);
  }
  /**
   * Signin 
   */
  static Signin(data) {
    const validationSchema = {
      email: Joi.string().required(),
      password: Joi.string().required(),
    }

    const schema = Joi.object(validationSchema);

    return schema.validate(data);
  }
  /**
   * RefreshToken 
   */
  static RefreshToken(data) {
    const validationSchema = {
      refreshToken: Joi.string().required(),
    }

    const schema = Joi.object(validationSchema);

    return schema.validate(data);
  }
  /**
   * ActivateMFAToken 
   */
  static ActivateMFAToken(data) {
    const validationSchema = {
      accessToken: Joi.string().required(),
      code: Joi.string().required(),
    }

    const schema = Joi.object(validationSchema);

    return schema.validate(data);
  }
  /**
   * ResendMFACode 
   */
  static ResendMFACode(data) {
    const validationSchema = {
      accessToken: Joi.string().required(),
    }

    const schema = Joi.object(validationSchema);

    return schema.validate(data);
  }
  /**
   * GeneratePasswordResetCode 
   */
  static GeneratePasswordResetCode(data) {
    const validationSchema = {
      email: Joi.string().required(),

    }
    const schema = Joi.object(validationSchema);

    return schema.validate(data);
  }
  /**
   * VerifyPasswordResetCode 
   */
  static VerifyPasswordResetCode(data) {
    const validationSchema = {
      email: Joi.string().required(),
      code: Joi.string().required(),

    }
    const schema = Joi.object(validationSchema);

    return schema.validate(data);
  }
  /**
   * ResetPassword 
   */
  static ResetPassword(data) {
    const validationSchema = {
      token: Joi.string().required(),
      password: Joi.string().required(),

    }
    const schema = Joi.object(validationSchema);

    return schema.validate(data);
  }
  /**
   * ChangePassword 
   */
  static ChangePassword(data) {
    const validationSchema = {
      oldPassword: Joi.string().required(),
      newPassword: Joi.string().required(),

    }
    const schema = Joi.object(validationSchema);

    return schema.validate(data);
  }

}