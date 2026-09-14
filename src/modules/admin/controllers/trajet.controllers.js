/**
 * @TrajetController 
 */

const CoreServices = require("../../../shared/services/core.services")
module.exports = class TrajetController extends CoreServices {

  constructor() {
    super()

    this.TrajetServices = new(require("../../admin/services/trajet.services"))();
    this.TrajetValidations = require("../../admin/validations/trajet.validations");
  }
  /**
   * Trajet Create
   * ******************
   * @name create
   * @route  POST /trajet
   * @type 
   * @description 
   * ******************
   * 
   */
  create = async (req, res) => {
    // Validate data
    const {
      error
    } = this.TrajetValidations.CreateValidation(req.body);
    if (error) throw new this.ValidationError(error.details[0].message);


    const payload = {
      ...req.body
    }

    const save = await this.TrajetServices.create(payload);

    res.json({
      data: save,
      success: true,
      message: this.SUCCESS_MESSAGES.CREATED_SUCCESSFULLY('Trajet')
    })
  };
  /**
   * Trajet Update
   * ******************
   * @name update
   * @route  PUT /trajet/:id
   * @type 
   * @description 
   * ******************
   * 
   */
  update = async (req, res) => {
    // Validate data
    const {
      error
    } = this.TrajetValidations.UpdateValidation(req.body);
    if (error) throw new this.ValidationError(error.details[0].message);
    const query = {
      _id: req.params.id,

    }


    const payload = {
      ...req.body
    }


    const trajet = await this.TrajetServices.update(query, payload);

    res.json({
      data: trajet,
      success: true,
      message: this.SUCCESS_MESSAGES.UPDATED_SUCCESSFULLY('Trajet')

    })
  };
  /**
   * Trajet Delete
   * ******************
   * @name delete
   * @route  DELETE /trajet/:id
   * @type 
   * @description 
   * ******************
   * 
   */
  delete = async (req, res) => {
    const query = {
      _id: req.params.id,
    }

    const data = await this.TrajetServices.delete(query)
    res.json({
      success: true,
      data,
      message: this.SUCCESS_MESSAGES.DELETED_SUCCESSFULLY('Category')
    })
  };
  /**
   * Trajet FindAll
   * ******************
   * @name findAll
   * @route  GET /trajet
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
      route: "/trajet",
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
    if (query.date_startStart || query.date_startEnd) {
      querySchema.push({
        date_start: this.HelperMethods.getPeriodSchema({
          periodStartDate: query.date_startStart,
          periodEndDate: query.date_startEnd,
        })
      })
    }
    if (query.date_endStart || query.date_endEnd) {
      querySchema.push({
        date_end: this.HelperMethods.getPeriodSchema({
          periodStartDate: query.date_endStart,
          periodEndDate: query.date_endEnd,
        })
      })
    }
    if (query.stop_time) {
      querySchema.push({
        stop_time: Number(query.stop_time)
      })
    }
    if (query.stop_timeLessThanOrEqualTo) {
      querySchema.push({
        stop_time: {
          $lte: Number(query.stop_timeLessThanOrEqualTo)
        }
      })

    } else if (query.stop_timeLessThan) {
      querySchema.push({
        stop_time: {
          $lt: Number(query.stop_timeLessThan)
        }
      })
    }
    if (query.stop_timeGreaterThanOrEqualTo) {
      querySchema.push({
        stop_time: {
          $gte: Number(query.stop_timeGreaterThanOrEqualTo)
        }
      })
    } else if (query.stop_timeGreaterThan) {
      querySchema.push({
        stop_time: {
          $gt: Number(query.stop_timeGreaterThan)
        }
      })
    }
    if (query.stop_nb) {
      querySchema.push({
        stop_nb: Number(query.stop_nb)
      })
    }
    if (query.stop_nbLessThanOrEqualTo) {
      querySchema.push({
        stop_nb: {
          $lte: Number(query.stop_nbLessThanOrEqualTo)
        }
      })

    } else if (query.stop_nbLessThan) {
      querySchema.push({
        stop_nb: {
          $lt: Number(query.stop_nbLessThan)
        }
      })
    }
    if (query.stop_nbGreaterThanOrEqualTo) {
      querySchema.push({
        stop_nb: {
          $gte: Number(query.stop_nbGreaterThanOrEqualTo)
        }
      })
    } else if (query.stop_nbGreaterThan) {
      querySchema.push({
        stop_nb: {
          $gt: Number(query.stop_nbGreaterThan)
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
    if (query.vehicle_id) {
      querySchema.push({
        ["vehicle_id._id"]: this.HelperMethods.generateObjectId(query.vehicle_id)
      })
    }
    if (query.distance) {
      querySchema.push({
        distance: Number(query.distance)
      })
    }
    if (query.distanceLessThanOrEqualTo) {
      querySchema.push({
        distance: {
          $lte: Number(query.distanceLessThanOrEqualTo)
        }
      })

    } else if (query.distanceLessThan) {
      querySchema.push({
        distance: {
          $lt: Number(query.distanceLessThan)
        }
      })
    }
    if (query.distanceGreaterThanOrEqualTo) {
      querySchema.push({
        distance: {
          $gte: Number(query.distanceGreaterThanOrEqualTo)
        }
      })
    } else if (query.distanceGreaterThan) {
      querySchema.push({
        distance: {
          $gt: Number(query.distanceGreaterThan)
        }
      })
    }
    if (query.average_speed) {
      querySchema.push({
        average_speed: Number(query.average_speed)
      })
    }
    if (query.average_speedLessThanOrEqualTo) {
      querySchema.push({
        average_speed: {
          $lte: Number(query.average_speedLessThanOrEqualTo)
        }
      })

    } else if (query.average_speedLessThan) {
      querySchema.push({
        average_speed: {
          $lt: Number(query.average_speedLessThan)
        }
      })
    }
    if (query.average_speedGreaterThanOrEqualTo) {
      querySchema.push({
        average_speed: {
          $gte: Number(query.average_speedGreaterThanOrEqualTo)
        }
      })
    } else if (query.average_speedGreaterThan) {
      querySchema.push({
        average_speed: {
          $gt: Number(query.average_speedGreaterThan)
        }
      })
    }
    if (query.max_speed) {
      querySchema.push({
        max_speed: Number(query.max_speed)
      })
    }
    if (query.max_speedLessThanOrEqualTo) {
      querySchema.push({
        max_speed: {
          $lte: Number(query.max_speedLessThanOrEqualTo)
        }
      })

    } else if (query.max_speedLessThan) {
      querySchema.push({
        max_speed: {
          $lt: Number(query.max_speedLessThan)
        }
      })
    }
    if (query.max_speedGreaterThanOrEqualTo) {
      querySchema.push({
        max_speed: {
          $gte: Number(query.max_speedGreaterThanOrEqualTo)
        }
      })
    } else if (query.max_speedGreaterThan) {
      querySchema.push({
        max_speed: {
          $gt: Number(query.max_speedGreaterThan)
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


    const output = await this.TrajetServices.getPaginatedList(pipeline, options)

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
   * Trajet FindOne
   * ******************
   * @name findOne
   * @route  GET /trajet/:id
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

    const data = await this.TrajetServices.findOne(querySchema)
    if (!data) throw new this.NotFoundError(this.ERROR_MESSAGES.CAN_NOT_FIND('this admin'), this.ERROR_CODES.CAN_NOT_FIND, this.STATUS_CODES.NOT_FOUND)
    res.json({
      data: data,
      success: true,
      message: this.SUCCESS_MESSAGES.RETRIEVED_SUCCESSFULLY('Trajet')
    })
  };

}