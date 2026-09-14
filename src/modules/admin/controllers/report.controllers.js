/**
 * @ReportController 
 */

const CoreServices = require("../../../shared/services/core.services")
module.exports = class ReportController extends CoreServices {

  constructor() {
    super()

    this.ReportServices = new(require("../../admin/services/report.services"))();
    this.ReportValidations = require("../../admin/validations/report.validations");
  }
  /**
   * Report Create
   * ******************
   * @name create
   * @route  POST /report
   * @type 
   * @description 
   * ******************
   * 
   */
  create = async (req, res) => {
    // Validate data
    const {
      error
    } = this.ReportValidations.CreateValidation(req.body);
    if (error) throw new this.ValidationError(error.details[0].message);


    const payload = {
      ...req.body
    }

    const save = await this.ReportServices.create(payload);

    res.json({
      data: save,
      success: true,
      message: this.SUCCESS_MESSAGES.CREATED_SUCCESSFULLY('Report')
    })
  };
  /**
   * Report Update
   * ******************
   * @name update
   * @route  PUT /report/:id
   * @type 
   * @description 
   * ******************
   * 
   */
  update = async (req, res) => {
    // Validate data
    const {
      error
    } = this.ReportValidations.UpdateValidation(req.body);
    if (error) throw new this.ValidationError(error.details[0].message);
    const query = {
      _id: req.params.id,

    }


    const payload = {
      ...req.body
    }


    const report = await this.ReportServices.update(query, payload);

    res.json({
      data: report,
      success: true,
      message: this.SUCCESS_MESSAGES.UPDATED_SUCCESSFULLY('Report')

    })
  };
  /**
   * Report Delete
   * ******************
   * @name delete
   * @route  DELETE /report/:id
   * @type 
   * @description 
   * ******************
   * 
   */
  delete = async (req, res) => {
    const query = {
      _id: req.params.id,
    }

    const data = await this.ReportServices.delete(query)
    res.json({
      success: true,
      data,
      message: this.SUCCESS_MESSAGES.DELETED_SUCCESSFULLY('Category')
    })
  };
  /**
   * Report FindAll
   * ******************
   * @name findAll
   * @route  GET /report
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
      route: "/report",
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
    if (query.id_admin) {
      querySchema.push({
        ["id_admin._id"]: this.HelperMethods.generateObjectId(query.id_admin)
      })
    }
    if (query.id_vehicule) {
      querySchema.push({
        ["id_vehicule._id"]: this.HelperMethods.generateObjectId(query.id_vehicule)
      })
    }
    if (query.report_type) {
      querySchema.push({
        report_type: {
          $regex: ".*" + query.report_type + ".*",
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
    if (query.periode_debutStart || query.periode_debutEnd) {
      querySchema.push({
        periode_debut: this.HelperMethods.getPeriodSchema({
          periodStartDate: query.periode_debutStart,
          periodEndDate: query.periode_debutEnd,
        })
      })
    }
    if (query.periode_finStart || query.periode_finEnd) {
      querySchema.push({
        periode_fin: this.HelperMethods.getPeriodSchema({
          periodStartDate: query.periode_finStart,
          periodEndDate: query.periode_finEnd,
        })
      })
    }
    if (query.statutStart || query.statutEnd) {
      querySchema.push({
        statut: this.HelperMethods.getPeriodSchema({
          periodStartDate: query.statutStart,
          periodEndDate: query.statutEnd,
        })
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


    const output = await this.ReportServices.getPaginatedList(pipeline, options)

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
   * Report FindOne
   * ******************
   * @name findOne
   * @route  GET /report/:id
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

    const data = await this.ReportServices.findOne(querySchema)
    if (!data) throw new this.NotFoundError(this.ERROR_MESSAGES.CAN_NOT_FIND('this admin'), this.ERROR_CODES.CAN_NOT_FIND, this.STATUS_CODES.NOT_FOUND)
    res.json({
      data: data,
      success: true,
      message: this.SUCCESS_MESSAGES.RETRIEVED_SUCCESSFULLY('Report')
    })
  };

}