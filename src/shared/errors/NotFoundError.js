const ApiError = require('./ApiError');
const ERROR_MESSAGES = require('../constants/errorMessages')
const ERROR_CODES = require('../constants/errorCodes')
const STATUS_CODES = require('../constants/statusCodes')
const ERROR_SEVERITY = require('../constants/errorSeverity')

/**
 * NotFoundError class for 404 errors.
 */
module.exports = class NotFoundError extends ApiError {

  constructor(message = ERROR_MESSAGES.CAN_NOT_FIND("resource"), errors = [], stack = "") {
    super(
      message,
      ERROR_CODES.CAN_NOT_FIND,
      STATUS_CODES.NOT_FOUND,
      ERROR_SEVERITY.LOW,
      errors,
      stack
    );
  }
}