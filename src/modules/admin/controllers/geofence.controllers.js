/**
 * @GeofenceController 
 */

const CoreServices = require("../../../shared/services/core.services")
module.exports = class GeofenceController extends CoreServices {

  constructor() {
    super()

    this.GeofenceServices = new(require("../../admin/services/geofence.services"))();
    this.GeofenceValidations = require("../../admin/validations/geofence.validations");
  }
  /**
   * Geofence Create
   * ******************
   * @name create
   * @route  POST /geofence
   * @type 
   * @description 
   * ******************
   * 
   */
  create = async (req, res) => {
    // Validate data
    const {
      error
    } = this.GeofenceValidations.CreateValidation(req.body);
    if (error) throw new this.ValidationError(error.details[0].message);


    const payload = {
      ...req.body
    }

    const save = await this.GeofenceServices.create(payload);

    res.json({
      data: save,
      success: true,
      message: this.SUCCESS_MESSAGES.CREATED_SUCCESSFULLY('Geofence')
    })
  };
  /**
   * Geofence Update
   * ******************
   * @name update
   * @route  PUT /geofence/:id
   * @type 
   * @description 
   * ******************
   * 
   */
  update = async (req, res) => {
    // Validate data
    const {
      error
    } = this.GeofenceValidations.UpdateValidation(req.body);
    if (error) throw new this.ValidationError(error.details[0].message);
    const query = {
      _id: req.params.id,

    }


    const payload = {
      ...req.body
    }


    const geofence = await this.GeofenceServices.update(query, payload);

    res.json({
      data: geofence,
      success: true,
      message: this.SUCCESS_MESSAGES.UPDATED_SUCCESSFULLY('Geofence')

    })
  };
  /**
   * Geofence Delete
   * ******************
   * @name delete
   * @route  DELETE /geofence/:id
   * @type 
   * @description 
   * ******************
   * 
   */
  delete = async (req, res) => {
    const query = {
      _id: req.params.id,
    }

    const data = await this.GeofenceServices.delete(query)
    res.json({
      success: true,
      data,
      message: this.SUCCESS_MESSAGES.DELETED_SUCCESSFULLY('Category')
    })
  };
  /**
   * Geofence FindAll
   * ******************
   * @name findAll
   * @route  GET /geofence
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
      route: "/geofence",
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
    if (query.zone_name) {
      querySchema.push({
        zone_name: {
          $regex: ".*" + query.zone_name + ".*",
          $options: "i",
        }
      })

    }
    if (query.type_zone) {
      querySchema.push({
        type_zone: {
          $regex: ".*" + query.type_zone + ".*",
          $options: "i",
        }
      })

    }
    if (query.coordinates) {
      querySchema.push({
        coordinates: {
          $regex: ".*" + query.coordinates + ".*",
          $options: "i",
        }
      })

    }
    if (query.perimeter) {
      querySchema.push({
        perimeter: Number(query.perimeter)
      })
    }
    if (query.perimeterLessThanOrEqualTo) {
      querySchema.push({
        perimeter: {
          $lte: Number(query.perimeterLessThanOrEqualTo)
        }
      })

    } else if (query.perimeterLessThan) {
      querySchema.push({
        perimeter: {
          $lt: Number(query.perimeterLessThan)
        }
      })
    }
    if (query.perimeterGreaterThanOrEqualTo) {
      querySchema.push({
        perimeter: {
          $gte: Number(query.perimeterGreaterThanOrEqualTo)
        }
      })
    } else if (query.perimeterGreaterThan) {
      querySchema.push({
        perimeter: {
          $gt: Number(query.perimeterGreaterThan)
        }
      })
    }
    if (query.statut == 'true') {
      querySchema.push({
        statut: true
      })
    }
    if (query.statut == 'false') {
      querySchema.push({
        statut: false
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


    const output = await this.GeofenceServices.getPaginatedList(pipeline, options)

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
   * Geofence FindOne
   * ******************
   * @name findOne
   * @route  GET /geofence/:id
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

    const data = await this.GeofenceServices.findOne(querySchema)
    if (!data) throw new this.NotFoundError(this.ERROR_MESSAGES.CAN_NOT_FIND('this admin'), this.ERROR_CODES.CAN_NOT_FIND, this.STATUS_CODES.NOT_FOUND)
    res.json({
      data: data,
      success: true,
      message: this.SUCCESS_MESSAGES.RETRIEVED_SUCCESSFULLY('Geofence')
    })
  };

}