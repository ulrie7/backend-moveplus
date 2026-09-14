const Email = require("../services/email.services")
const Logger = require('../../config/logger/winston.logger');

const ERROR_MESSAGES = require('../constants/errorMessages')
const ERROR_CODES = require('../constants/errorCodes')
const STATUS_CODES = require('../constants/statusCodes')
const ERROR_SEVERITY = require('../constants/errorSeverity')
/**
 * @description Common Error class to throw an error from anywhere.
 */
module.exports = class ApiError extends Error {

  constructor(message = ERROR_MESSAGES.GENERIC_ERROR, errorCode = ERROR_CODES.GENERIC_ERROR, statusCode = STATUS_CODES.BAD_REQUEST, severity = ERROR_SEVERITY.LOW, errors = [], stack = "") {
    super(message);
    this.statusCode = statusCode;
    this.data = null;
    this.message = message;
    this.errorCode = errorCode;
    this.success = false;
    this.errors = errors;

    const loggerFormat = `
        Error occurred with status code ${statusCode}:
            Message: ${message}
            Severity: ${severity} severity
            Errors: ${JSON.stringify(errors)}
         
        `
    if ([ERROR_SEVERITY.CRITICAL, ERROR_SEVERITY.HIGH].includes(severity)) {
      const locals = {
        statusCode: statusCode,
        message: message,
        severity: severity,
        errors: JSON.stringify(errors)
      };

      Email.sendEmail(process.env.DEV_TEAM_MAILS, locals, 'api-error').then(() => {
        console.log("Error sent to dev team.")
      })

    }

    switch (severity) {
      case ERROR_SEVERITY.CRITICAL:
        Logger.error(loggerFormat)
        break;
      case ERROR_SEVERITY.HIGH:
        Logger.error(loggerFormat)
        break;
      case ERROR_SEVERITY.MEDIUM:
        Logger.error(loggerFormat)
        break;

      default:
        Logger.warn(loggerFormat)
        break;
    }

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
    Logger.error(this.stack)
  }
  /**
   * @formatErrorResponse
   */
  formatErrorResponse() {
    return {
      success: this.success,
      message: this.message,
      errorCode: this.errorCode,
      statusCode: this.statusCode,
      severity: this.severity,
      errors: this.errors,
      stack: process.env.NODE_ENV === 'development' ? this.stack : undefined, // Include stack trace only in development
    };
  }

}