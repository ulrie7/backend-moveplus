/**
 * Imports and defines 'ApiError' as a global property.
 * 'ApiError' is a custom class for handling API errors.
 */

global.ApiError = require("../../shared/errors/ApiError")

/**
 * Imports and defines 'NotFoundError' as a global property.
 * 'NotFoundError' is a custom class for handling NotFound errors.
 */

global.NotFoundError = require("../../shared/errors/NotFoundError")

/**
 * Imports and defines 'UnauthorizedError' as a global property.
 * 'UnauthorizedError' is a custom class for handling Unauthorized errors.
 */

global.UnauthorizedError = require("../../shared/errors/UnauthorizedError")

/**
 * Imports and defines 'ValidationError' as a global property.
 * 'ValidationError' is a custom class for handling Validation errors.
 */

global.ValidationError = require("../../shared/errors/ValidationError")