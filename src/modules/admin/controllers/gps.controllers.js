/**
 * @GPSController 
 */

const CoreServices = require("../../../shared/services/core.services")
module.exports = class GPSController extends CoreServices {

  constructor() {
    super()

    this.GPSServices = new(require("../../admin/services/gps.services"))();
    this.GPSValidations = require("../../admin/validations/gps.validations");
  }
  /**
   * GPS Create
   * ******************
   * @name create
   * @route  POST /gps
   * @type 
   * @description 
   * ******************
   * 
   */
  create = async (req, res) => {
    // Validate data
    const {
      error
    } = this.GPSValidations.CreateValidation(req.body);
    if (error) throw new this.ValidationError(error.details[0].message);


    const payload = {
      ...req.body
    }

    const save = await this.GPSServices.create(payload);

    res.json({
      data: save,
      success: true,
      message: this.SUCCESS_MESSAGES.CREATED_SUCCESSFULLY('GPS')
    })
  };
  /**
   * GPS Update
   * ******************
   * @name update
   * @route  PUT /gps/:id
   * @type 
   * @description 
   * ******************
   * 
   */
  update = async (req, res) => {
    // Validate data
    const {
      error
    } = this.GPSValidations.UpdateValidation(req.body);
    if (error) throw new this.ValidationError(error.details[0].message);
    const query = {
      _id: req.params.id,

    }


    const payload = {
      ...req.body
    }


    const gps = await this.GPSServices.update(query, payload);

    res.json({
      data: gps,
      success: true,
      message: this.SUCCESS_MESSAGES.UPDATED_SUCCESSFULLY('GPS')

    })
  };
  /**
   * GPS Delete
   * ******************
   * @name delete
   * @route  DELETE /gps/:id
   * @type 
   * @description 
   * ******************
   * 
   */
  delete = async (req, res) => {
    const query = {
      _id: req.params.id,
    }

    const data = await this.GPSServices.delete(query)
    res.json({
      success: true,
      data,
      message: this.SUCCESS_MESSAGES.DELETED_SUCCESSFULLY('Category')
    })
  };
  /**
   * GPS FindAll
   * ******************
   * @name findAll
   * @route  GET /gps
   * @type 
   * @description 
   * ******************
   * 
   */
  findAll = async (req, res) => {
    const profile = req.admin;
    const query = req.query

    const options = {
      perPage: process.env.PAGINATION_TOTAL_PER_PAGE || 10,
      page: 1,
      route: "/gps",
      query: query,
      withOutDeletedRestriction: query.withOutDeletedRestriction,
      onlyDeletedData: query.onlyDeletedData,
    }

    if (query.page) {
      options.page = query.page
    }
    if (query.perPage) {
      options.perPage = query.perPage
    }

    let countDocumentSchema = {}

    const querySchema = []
    if (query.createdBy) {
      querySchema.push({
        ["createdBy._id"]: this.HelperMethods.generateObjectId(query.createdBy)
      })
    }
    if (query.updatedBy) {
      querySchema.push({
        ["updatedBy._id"]: this.HelperMethods.generateObjectId(query.updatedBy)
      })
    }
    if (query.deletedBy) {
      querySchema.push({
        ["deletedBy._id"]: this.HelperMethods.generateObjectId(query.deletedBy)
      })
    }
    if (query.imei) {
      querySchema.push({
        imei: {
          $regex: ".*" + query.imei + ".*",
          $options: "i",
        }
      })

    }
    if (query.status) {
      querySchema.push({
        status: {
          $regex: ".*" + query.status + ".*",
          $options: "i",
        }
      })

    }
    if (query.battery) {
      querySchema.push({
        battery: Number(query.battery)
      })
    }
    if (query.batteryLessThanOrEqualTo) {
      querySchema.push({
        battery: {
          $lte: Number(query.batteryLessThanOrEqualTo)
        }
      })

    } else if (query.batteryLessThan) {
      querySchema.push({
        battery: {
          $lt: Number(query.batteryLessThan)
        }
      })
    }
    if (query.batteryGreaterThanOrEqualTo) {
      querySchema.push({
        battery: {
          $gte: Number(query.batteryGreaterThanOrEqualTo)
        }
      })
    } else if (query.batteryGreaterThan) {
      querySchema.push({
        battery: {
          $gt: Number(query.batteryGreaterThan)
        }
      })
    }
    if (query.brand) {
      querySchema.push({
        brand: {
          $regex: ".*" + query.brand + ".*",
          $options: "i",
        }
      })

    }
    if (query.last_connexionStart || query.last_connexionEnd) {
      querySchema.push({
        last_connexion: this.HelperMethods.getPeriodSchema({
          periodStartDate: query.last_connexionStart,
          periodEndDate: query.last_connexionEnd,
        })
      })
    }
    if (query.model_device) {
      querySchema.push({
        model_device: {
          $regex: ".*" + query.model_device + ".*",
          $options: "i",
        }
      })

    }
    if (query.vehicle_id) {
      querySchema.push({
        ["vehicle_id._id"]: this.HelperMethods.generateObjectId(query.vehicle_id)
      })
    }


    options.countDocumentSchema = this.convertArrayToObjectQuerySchema(querySchema, countDocumentSchema, {
      ignoredSubPrivateData: true
    })

    const pipeline = []
    if (querySchema.length > 0) {
      pipeline.push({
        $match: {
          $or: [{
            $and: querySchema
          }]
        }
      })
    }


    const output = await this.GPSServices.getPaginatedList(pipeline, options)

    res.json({
      page: output.page,
      totalPages: output.totalPages,
      totalItems: output.totalItems,
      perPage: output.perPage,
      data: output.data,
      nextLink: output.nextLink,
      prevLink: output.prevLink,
      success: true,
    })
  };
  /**
   * GPS FindOne
   * ******************
   * @name findOne
   * @route  GET /gps/:id
   * @type 
   * @description 
   * ******************
   * 
   */
  findOne = async (req, res) => {
    const profile = req.admin;

    const querySchema = {
      _id: req.params.id,
    }

    const data = await this.GPSServices.findOne(querySchema)
    if (!data) throw new this.NotFoundError(this.ERROR_MESSAGES.CAN_NOT_FIND('this admin'), this.ERROR_CODES.CAN_NOT_FIND, this.STATUS_CODES.NOT_FOUND)
    res.json({
      data: data,
      success: true,
      message: this.SUCCESS_MESSAGES.RETRIEVED_SUCCESSFULLY('GPS')
    })
  };

}