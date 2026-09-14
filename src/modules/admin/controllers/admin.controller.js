/**
 * @Admin 
 */

const CoreServices = require("../../../shared/services/core.services")
module.exports = class AdminController extends CoreServices {

  constructor() {
    super()
    this.AdminServices = new(require("../../admin/services/admin.services"))();
    this.AdminValidations = require("../../admin/validations/admin.validations");
    this.AdminResource = require("../resources/admin.resources");
  }
  /**
   * Admin Create
   * ******************
   * @name create
   * @route  POST /admin
   * @type create
   * @description
   * ******************
   * 
   */
  create = async (req, res) => {
    // Validate data
    const {
      error
    } = this.AdminValidations.CreateValidation(req.body);

    if (error) throw new this.ValidationError(error.details[0].message);


    const payload = {
      ...req.body
    }

    const save = await this.AdminServices.findOrCreate(payload)


    res.json({
      data: save,
      message: this.SUCCESS_MESSAGES.CREATED_SUCCESSFULLY("admin"),
      success: true,
    })
  };
  /**
   * Admin Update
   * ******************
   * @name update
   * @route  PUT /admin/:id
   * @type 
   * @description 
   * ******************
   * 
   */
  update = async (req, res) => {
    // Validate data
    const {
      error
    } = this.AdminValidations.UpdateValidation(req.body);
    if (error) throw new this.ValidationError(error.details[0].message);
    const query = {
      _id: req.params.id,
    }
    const profile = req.admin;


    const payload = {
      ...req.body
    }

    const admin = await this.AdminServices.update(query, payload, profile);


    res.json({
      data: admin,
      message: this.SUCCESS_MESSAGES.UPDATED_SUCCESSFULLY("admin"),
      success: true,
    })
  };
  /**
   * Admin Delete
   * ******************
   * @route  DELETE /admin/:id
   * @type 
   * @description 
   * ******************
   * 
   */
  delete = async (req, res) => {
    const query = {
      _id: req.params.id,
    }
    const profile = req.admin;

    const data = await this.AdminServices.delete(query, profile)

    res.json({
      data: data,
      success: true,
      message: this.SUCCESS_MESSAGES.DELETED_SUCCESSFULLY('Admin')
    })
  };
  /**
   * Admin GetList
   * ******************
   * @name findAll
   * @route  GET /admin
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
      route: "/admin",
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
    if (query.firstName) {
      querySchema.push({
        firstName: {
          $regex: ".*" + query.firstName + ".*",
          $options: "i",
        }
      })

    }
    if (query.lastName) {
      querySchema.push({
        lastName: {
          $regex: ".*" + query.lastName + ".*",
          $options: "i",
        }
      })

    }
    if (query.email) {
      querySchema.push({
        email: {
          $regex: ".*" + query.email + ".*",
          $options: "i",
        }
      })

    }
    if (query.identity) {
      querySchema.push({
        ["identity._id"]: this.HelperMethods.generateObjectId(query.identity)
      })
    }
    if (query.isActive == 'true') {
      querySchema.push({
        isActive: true
      })
    }
    if (query.isActive == 'false') {
      querySchema.push({
        isActive: false
      })
    }
    if (query.isBlocked == 'true') {
      querySchema.push({
        isBlocked: true
      })
    }
    if (query.isBlocked == 'false') {
      querySchema.push({
        isBlocked: false
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


    const output = await this.AdminServices.getPaginatedList(pipeline, options)

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
   * Admin FindOne
   * ******************
   * @name findOne
   * @route  GET /admin/:id
   * @type 
   * @description 
   * ******************
   * 
   */
  findOne = async (req, res) => {
    const querySchema = {
      _id: req.params.id,
    }

    const data = await this.AdminServices.findOne(querySchema)
    if (!data) throw new this.NotFoundError(this.ERROR_MESSAGES.CAN_NOT_FIND('this admin'), this.ERROR_CODES.CAN_NOT_FIND, this.STATUS_CODES.NOT_FOUND)
    res.json({
      data: data,
      success: true,
      message: this.SUCCESS_MESSAGES.RETRIEVED_SUCCESSFULLY('Admin')
    })
  };
  /**
   * Admin GetProfile
   * ******************
   * @name getProfile
   * @route  GET /admin/profile
   * @type 
   * @description 
   * ******************
   * 
   */
  getProfile = async (req, res) => {
    let data = await this.AdminResource.collection(req.admin)

    res.json({
      success: true,
      data: data
    })
  };
  /**
   * Admin UpdateProfile
   * ******************
   * @name updateProfile
   * @route  PUT /admin/profile
   * @type 
   * @description 
   * ******************
   * 
   */
  updateProfile = async (req, res) => {
    const profile = req.admin;

    // Validate data
    const {
      error
    } = this.AdminValidations.UpdateValidation(req.body);
    if (error) throw new this.ValidationError(error.details[0].message);

    const payload = {
      ...req.body
    }

    const admin = await this.AdminServices.updateProfile(payload, profile);


    res.json({
      data: admin,
      message: this.SUCCESS_MESSAGES.UPDATED_SUCCESSFULLY("admin"),
      success: true,
    })
  };
  /**
   * Admin DeleteProfile
   * ******************
   * @route  DELETE /admin/profile
   * @type 
   * @description 
   * ******************
   * 
   */
  deleteProfile = async (req, res) => {
    const profile = req.admin;

    const data = await this.AdminServices.deleteProfile(profile)

    res.json({
      data: data,
      success: true,
      message: this.SUCCESS_MESSAGES.DELETED_SUCCESSFULLY('Admin')
    })
  };

}