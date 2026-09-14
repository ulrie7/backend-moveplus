/**
 * @CoreServices 
 */
module.exports = class CoreServices {

  constructor() {
    this.Logger = require('../../config/logger/winston.logger');
    this.Email = require("./email.services")
    this.Whatsapp = require("./whatsapp.services")
    this.Sms = require("./sms.services")
    this.MessageDispatcher = require("../lib/message_dispatcher")

    this.ApiError = require("../errors/ApiError")
    this.NotFoundError = require("../errors/NotFoundError")
    this.UnauthorizedError = require("../errors/UnauthorizedError")
    this.ValidationError = require("../errors/ValidationError")

    this.HelperMethods = new(require("../utils/helper.utils"))()

    this.STATUS_CODES = require("../constants/statusCodes")
    this.ERROR_MESSAGES = require("../constants/errorMessages")
    this.ERROR_CODES = require("../constants/errorCodes")
    this.SUCCESS_MESSAGES = require("../constants/successMessages")
    this.TIME_SETTINGS = require("../constants/timeSettings")
    this.COLORS = require("../constants/colors")
    this.EMAIL_TEMPLATES = require("../constants/emailTemplates")
    this.SMS_TEMPLATES = require("../constants/smsTemplates")

    this.SessionManager = require('../lib/session_manager')

    this.CommonConstants = {
      STATUS_CODES: this.STATUS_CODES,
      ERROR_MESSAGES: this.ERROR_MESSAGES,
      SUCCESS_MESSAGES: this.SUCCESS_MESSAGES,
      TIME_SETTINGS: this.TIME_SETTINGS,
      COLORS: this.COLORS,
    }

    this.jwt = require("jsonwebtoken");
    this.bcrypt = require("bcryptjs");
    this.mongoose = require("mongoose");
    const {
      default: jwtDecode
    } = require("jwt-decode");
    this.jwtDecode = jwtDecode
    const {
      unlink
    } = require('fs-extra')
    this.unlink = unlink

    this.FS = require("../lib/fs")

    this.asyncHandler = fn => (req, res, next) =>
      Promise.resolve(fn(req, res, next)).catch(next)


    this.jwtVerify = (token, secret = process.env.SECRET_KEY) => {
      try {
        const decoded = this.jwt.verify(token, secret, {
          algorithms: ['HS256']
        });
        return decoded
      } catch (err) {
        console.error('Token is invalid or expired', err);
        return err
      }
    }
  }
  /**
   * @getPaginateAggregateDataService
   */
  getPaginateAggregateDataService = async (options) => {
    const {
      pipeline = [],
        page = 1,
        query = {},
        route = "",
        Model,
        includeDeleted = false,
        onlyDeleted = false,
        sort,
        countDocumentSchema
    } = options;

    let {
      perPage = 10
    } = options;
    perPage = Number(perPage);

    // Clone the pipeline to avoid modifying the original
    const processedPipeline = [...pipeline];

    // Add soft delete filter
    if (!includeDeleted && !onlyDeleted) {
      processedPipeline.unshift({
        $match: {
          deletedAt: {
            $exists: false
          }
        }
      });
    } else if (onlyDeleted) {
      processedPipeline.unshift({
        $match: {
          deletedAt: {
            $exists: true
          }
        }
      });
    }

    const skipCount = (page - 1) * perPage;

    if (sort) {
      processedPipeline.push({
        $sort: sort
      }, )
    }

    const dataPipeline = [
      ...processedPipeline,
      {
        $skip: skipCount
      },
      {
        $limit: perPage
      }
    ];

    let parallelQuery

    if (countDocumentSchema) {
      parallelQuery = [
        Model.countDocuments(countDocumentSchema),
        Model.aggregate(dataPipeline),
      ]
    } else {
      parallelQuery = [
        Model.aggregate([
          ...processedPipeline,
          {
            $count: "totalCount"
          }
        ]),
        Model.aggregate(dataPipeline),
      ]
    }
    let [totalItems, data] = await Promise.all(parallelQuery);
    if (!countDocumentSchema) {
      totalItems = totalItems[0] ? totalItems[0].totalCount : 0
    }
    const totalPages = Math.ceil(totalItems / perPage);

    return {
      data,
      totalItems,
      totalPages,
      nextLink: this.HelperMethods.getPaginationNextPage({
        currentPage: page,
        totalPages,
        query,
        route
      }),
      prevLink: this.HelperMethods.getPaginationPreviousPage({
        currentPage: page,
        query,
        route
      })
    };
  };
  /**
   * Converts an array-based query schema into an object-based query schema.
   *
   * @param {Array} arrayQuerySchema - The input array containing query schema definitions.
   * @param {Object} [objectQuerySchema={}] - The output object to populate with the converted schema.
   * @param {Object} [options={ ignoredSubPrivateData: true }] - Configuration options.
   * @param {boolean} [options.ignoredSubPrivateData=true] - Flag to ignore sub-private data fields.
   * @returns {Object} The constructed object-based query schema.
   */
  convertArrayToObjectQuerySchema(arrayQuerySchema, objectQuerySchema = {}, options = {
    ignoredSubPrivateData: true
  }) {
    const {
      ignoredSubPrivateData
    } = options;

    for (const item of arrayQuerySchema) {
      const [key, value] = Object.entries(item)[0];
      const keyParts = key.split(".");

      if (keyParts.length === 1) {
        objectQuerySchema[key] = value;
      } else if (keyParts.length === 2 && keyParts[1] === '_id') {
        objectQuerySchema[keyParts[0]] = value;
      } else {
        if (ignoredSubPrivateData) continue;
        const newKey = `_${keyParts[keyParts.length - 1]}`;
        objectQuerySchema[newKey] = value;
      }
    }

    return objectQuerySchema;
  }

}