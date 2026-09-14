const ApiError = require('./ApiError');
const ERROR_MESSAGES = require('../constants/errorMessages')
const ERROR_CODES = require('../constants/errorCodes')
const STATUS_CODES = require('../constants/statusCodes')
const ERROR_SEVERITY = require('../constants/errorSeverity')

/**
 * UnauthorizedError class for 401 errors.
 */
module.exports = class UnauthorizedError extends ApiError {

  constructor(message = ERROR_MESSAGES.INVALID_LOGIN, errors = [], stack = "") {
    super(
      message,
      ERROR_CODES.INVALID_LOGIN,
      STATUS_CODES.UNAUTHORIZED,
      ERROR_SEVERITY.MEDIUM,
      errors,
      stack
    );
  }
}