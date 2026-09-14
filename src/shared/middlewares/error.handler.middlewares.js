/**
 * @ErrorHandlerMiddleware 
 */
const ApiError = require("../errors/ApiError");
const mongoose = require("mongoose");
const fs = require("fs").promises;
module.exports = class ErrorHandlerMiddlewareMiddlewares {

  constructor() {

  }
  /**
   * Clean up uploaded files from request
   * Handles both single and multiple file uploads from multer
   * @private
   */
  async _cleanupUploadedFiles(req) {
    const filesToDelete = [];

    // Handle single file upload (req.file)
    if (req.file && req.file.path) {
      filesToDelete.push(req.file.path);
    }

    // Handle multiple files upload (req.files as array)
    if (Array.isArray(req.files)) {
      req.files.forEach(file => {
        if (file && file.path) {
          filesToDelete.push(file.path);
        }
      });
    }
    // Handle multiple files with field names (req.files as object)
    else if (req.files && typeof req.files === 'object') {
      Object.values(req.files).forEach(fileOrArray => {
        if (Array.isArray(fileOrArray)) {
          fileOrArray.forEach(file => {
            if (file && file.path) {
              filesToDelete.push(file.path);
            }
          });
        } else if (fileOrArray && fileOrArray.path) {
          filesToDelete.push(fileOrArray.path);
        }
      });
    }

    // Delete files asynchronously without blocking the error response
    if (filesToDelete.length > 0) {
      Promise.allSettled(
        filesToDelete.map(filePath =>
          fs.unlink(filePath).catch(err =>
            console.error(`Failed to delete file ${filePath}:`, err.message)
          )
        )
      ).catch(err => console.error('Error during file cleanup:', err));
    }
  }
  /**
   * @handler
   */
  async handler(err, req, res, next) {
    // Clean up uploaded files if any exist
    await this._cleanupUploadedFiles(req);

    let error = {
      ...err
    };
    error.message = err.message;

    let errorResponse;

    // Handle MongoDB/Mongoose errors
    if (err instanceof mongoose.Error) {
      // CastError (e.g., invalid ObjectId)
      if (err.name === 'CastError' && err.kind === 'ObjectId') {
        errorResponse = new ApiError("Invalid ObjectId Format", 400, "medium", [], `Invalid ID: ${err.value}`).formatErrorResponse();
      }
      // ValidationError (e.g., schema validation failed)
      else if (err.name === 'ValidationError') {
        errorResponse = new ApiError("Schema Validation Error", 400, "medium", Object.values(err.errors), err.message).formatErrorResponse();
      }
      // MongoError (e.g., duplicate key, index errors)
      else if (err.code && err.code === 11000) {
        const duplicateKey = Object.keys(err.keyValue);
        errorResponse = new ApiError("Duplicate Key Error", 409, "medium", [], `Duplicate value for field(s): ${duplicateKey.join(', ')}`).formatErrorResponse();
      }
      // Other mongoose-related errors
      else {
        errorResponse = new ApiError("Database Error", 500, "medium", [], err.message).formatErrorResponse();
      }
    }
    // Handle multer errors (file upload errors)
    else if (err.name === 'MulterError') {
      let message = err.message;
      let statusCode = 400;

      switch (err.code) {
        case 'LIMIT_FILE_SIZE':
          message = 'File size exceeds the allowed limit';
          break;
        case 'LIMIT_FILE_COUNT':
          message = 'Too many files uploaded';
          break;
        case 'LIMIT_UNEXPECTED_FILE':
          message = 'Unexpected field in file upload';
          break;
        case 'LIMIT_PART_COUNT':
          message = 'Too many parts in the multipart request';
          break;
      }

      errorResponse = new ApiError("File Upload Error", statusCode, "medium", [], message).formatErrorResponse();
    }
    // Handle specific Node.js errors like "castle" errors
    else if (err.name === 'CastleError') {
      errorResponse = new ApiError("Security Error", 403, "high", [], err.message).formatErrorResponse();
    }
    // Handle custom ApiError
    else if (err instanceof ApiError) {
      errorResponse = err.formatErrorResponse();
    }
    // Handle any other uncaught errors
    else {
      const genericError = new ApiError("Internal Server Error", 500, "high", [], err.stack);
      errorResponse = genericError.formatErrorResponse();
    }

    // Log the error if needed (e.g., to a file or external service)
    res.status(error.statusCode || 500).json(errorResponse);
  }

}