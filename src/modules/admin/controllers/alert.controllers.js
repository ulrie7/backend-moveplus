/**
 * @AlertController 
 */

const CoreServices = require("../../../shared/services/core.services")
module.exports = class AlertController extends CoreServices {

  constructor() {
    super()

    this.AlertServices = new(require("../../admin/services/alert.services"))();
    this.AlertValidations = require("../../admin/validations/alert.validations");
  }
  /**
   * Alert Create
   * ******************
   * @name create
   * @route  POST /alert
   * @type 
   * @description 
   * ******************
   * 
   */
  create = async (req, res) => {
    // Validate data
    const {
      error
    } = this.AlertValidations.CreateValidation(req.body);
    if (error) throw new this.ValidationError(error.details[0].message);


    const payload = {
      ...req.body
    }

    const save = await this.AlertServices.create(payload);

    res.json({
      data: save,
      success: true,
      message: this.SUCCESS_MESSAGES.CREATED_SUCCESSFULLY('Alert')
    })
  };
  /**
   * Alert Update
   * ******************
   * @name update
   * @route  PUT /alert/:id
   * @type 
   * @description 
   * ******************
   * 
   */
  update = async (req, res) => {
    // Validate data
    const {
      error
    } = this.AlertValidations.UpdateValidation(req.body);
    if (error) throw new this.ValidationError(error.details[0].message);
    const query = {
      _id: req.params.id,

    }


    const payload = {
      ...req.body
    }


    const alert = await this.AlertServices.update(query, payload);

    res.json({
      data: alert,
      success: true,
      message: this.SUCCESS_MESSAGES.UPDATED_SUCCESSFULLY('Alert')

    })
  };
  /**
   * Alert Delete
   * ******************
   * @name delete
   * @route  DELETE /alert/:id
   * @type 
   * @description 
   * ******************
   * 
   */
  delete = async (req, res) => {
    const query = {
      _id: req.params.id,
    }

    const data = await this.AlertServices.delete(query)
    res.json({
      success: true,
      data,
      message: this.SUCCESS_MESSAGES.DELETED_SUCCESSFULLY('Category')
    })
  };
  /**
   * Alert FindAll
   * ******************
   * @name findAll
   * @route  GET /alert
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
      route: "/alert",
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
    if (query.gps_id) {
      querySchema.push({
        ["gps_id._id"]: this.HelperMethods.generateObjectId(query.gps_id)
      })
    }
    if (query.alert_type) {
      querySchema.push({
        alert_type: {
          $regex: ".*" + query.alert_type + ".*",
          $options: "i",
        }
      })

    }
    if (query.seuil) {
      querySchema.push({
        seuil: {
          $regex: ".*" + query.seuil + ".*",
          $options: "i",
        }
      })

    }
    if (query.date_generationStart || query.date_generationEnd) {
      querySchema.push({
        date_generation: this.HelperMethods.getPeriodSchema({
          periodStartDate: query.date_generationStart,
          periodEndDate: query.date_generationEnd,
        })
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
    if (query.message) {
      querySchema.push({
        message: {
          $regex: ".*" + query.message + ".*",
          $options: "i",
        }
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


    const output = await this.AlertServices.getPaginatedList(pipeline, options)

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
   * Alert FindOne
   * ******************
   * @name findOne
   * @route  GET /alert/:id
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

    const data = await this.AlertServices.findOne(querySchema)
    if (!data) throw new this.NotFoundError(this.ERROR_MESSAGES.CAN_NOT_FIND('this admin'), this.ERROR_CODES.CAN_NOT_FIND, this.STATUS_CODES.NOT_FOUND)
    res.json({
      data: data,
      success: true,
      message: this.SUCCESS_MESSAGES.RETRIEVED_SUCCESSFULLY('Alert')
    })
  };

}