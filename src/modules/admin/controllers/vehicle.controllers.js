/**
 * @VehicleController 
 */

const CoreServices = require("../../../shared/services/core.services")
module.exports = class VehicleController extends CoreServices {

  constructor() {
    super()

    this.VehicleServices = new(require("../../admin/services/vehicle.services"))();
    this.VehicleValidations = require("../../admin/validations/vehicle.validations");
  }
  /**
   * Vehicle Create
   * ******************
   * @name create
   * @route  POST /vehicle
   * @type 
   * @description 
   * ******************
   * 
   */
  create = async (req, res) => {
    // Validate data
    const {
      error
    } = this.VehicleValidations.CreateValidation(req.body);
    if (error) throw new this.ValidationError(error.details[0].message);


    const payload = {
      ...req.body
    }



    if (req.file && req.file.path) {
      payload.image = req.file.path;
    }

    const save = await this.VehicleServices.create(payload);

    res.json({
      data: save,
      success: true,
      message: this.SUCCESS_MESSAGES.CREATED_SUCCESSFULLY('Vehicle')
    })
  };
  /**
   * Vehicle Update
   * ******************
   * @name update
   * @route  PUT /vehicle/:id
   * @type 
   * @description 
   * ******************
   * 
   */
  update = async (req, res) => {
    // Validate data
    const {
      error
    } = this.VehicleValidations.UpdateValidation(req.body);
    if (error) throw new this.ValidationError(error.details[0].message);
    const query = {
      _id: req.params.id,

    }


    const payload = {
      ...req.body
    }



    if (req.file && req.file.path) {
      payload.image = req.file.path;
    }


    const vehicle = await this.VehicleServices.update(query, payload);

    res.json({
      data: vehicle,
      success: true,
      message: this.SUCCESS_MESSAGES.UPDATED_SUCCESSFULLY('Vehicle')

    })
  };
  /**
   * Vehicle Delete
   * ******************
   * @name delete
   * @route  DELETE /vehicle/:id
   * @type 
   * @description 
   * ******************
   * 
   */
  delete = async (req, res) => {
    const query = {
      _id: req.params.id,
    }

    const data = await this.VehicleServices.delete(query)
    res.json({
      success: true,
      data,
      message: this.SUCCESS_MESSAGES.DELETED_SUCCESSFULLY('Category')
    })
  };
  /**
   * Vehicle findAll
   * ******************
   * @name findAll
   * @route  GET /vehicle
   * @type 
   * @description 
   * ******************
   * 
   */
  findAll = async (req, res) => {
    const query = req.query

    const options = {
      perPage: process.env.PAGINATION_TOTAL_PER_PAGE || 10,
      page: 1,
      route: "/vehicle",
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
    if (query.immatriculation) {
      querySchema.push({
        immatriculation: {
          $regex: ".*" + query.immatriculation + ".*",
          $options: "i",
        }
      })

    }
    if (query.type_vehicule) {
      querySchema.push({
        type_vehicule: {
          $regex: ".*" + query.type_vehicule + ".*",
          $options: "i",
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
    if (query.modele) {
      querySchema.push({
        modele: {
          $regex: ".*" + query.modele + ".*",
          $options: "i",
        }
      })

    }
    if (query.color) {
      querySchema.push({
        color: {
          $regex: ".*" + query.color + ".*",
          $options: "i",
        }
      })

    }
    if (query.year) {
      querySchema.push({
        year: Number(query.year)
      })
    }
    if (query.yearLessThanOrEqualTo) {
      querySchema.push({
        year: {
          $lte: Number(query.yearLessThanOrEqualTo)
        }
      })

    } else if (query.yearLessThan) {
      querySchema.push({
        year: {
          $lt: Number(query.yearLessThan)
        }
      })
    }
    if (query.yearGreaterThanOrEqualTo) {
      querySchema.push({
        year: {
          $gte: Number(query.yearGreaterThanOrEqualTo)
        }
      })
    } else if (query.yearGreaterThan) {
      querySchema.push({
        year: {
          $gt: Number(query.yearGreaterThan)
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
    if (query.gps_id) {
      querySchema.push({
        ["gps_id._id"]: this.HelperMethods.generateObjectId(query.gps_id)
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


    const output = await this.VehicleServices.getPaginatedList(pipeline, options)

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
   * Vehicle FindOne
   * ******************
   * @name findOne
   * @route  GET /vehicle/:id
   * @type 
   * @description 
   * ******************
   * 
   */
  findOne = async (req, res) => {
    const querySchema = {
      _id: req.params.id,
    }

    const data = await this.VehicleServices.findOne(querySchema)
    if (!data) throw new this.NotFoundError(this.ERROR_MESSAGES.CAN_NOT_FIND('this admin'), this.ERROR_CODES.CAN_NOT_FIND, this.STATUS_CODES.NOT_FOUND)
    res.json({
      data: data,
      success: true,
      message: this.SUCCESS_MESSAGES.RETRIEVED_SUCCESSFULLY('Vehicle')
    })
  };

}