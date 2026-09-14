const ApiError = require('./ApiError');
const ERROR_MESSAGES = require('../constants/errorMessages')
const ERROR_CODES = require('../constants/errorCodes')
const STATUS_CODES = require('../constants/statusCodes')
const ERROR_SEVERITY = require('../constants/errorSeverity')

/**
 * ValidationError class for handling validation errors.
 */
module.exports = class ValidationError extends ApiError {

  constructor(message = ERROR_MESSAGES.VALIDATION_ERROR, errors = [], stack = "") {
    super(
      message,
      ERROR_CODES.VALIDATION_ERROR,
      STATUS_CODES.UNPROCESSABLE_ENTITY,
      ERROR_SEVERITY.MEDIUM,
      errors,
      stack
    );
  }
}