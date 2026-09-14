/**
 * @AdminServices
 */

const CoreServices = require("../../../shared/services/core.services")
module.exports = class AdminServices extends CoreServices {

  constructor() {
    super();
    this.Admin = require("../../admin/models/admin.model");
    this.AdminResources = require("../../admin/resources/admin.resources");

    this.AuthIdentityEnum = require("../../auth/enums/identity.auth.enum");
    this.AuthServices = new(require("../../auth/services/auth.services"))();
  }
  /**
   * @instanceAlreadyExist
   */
  instanceAlreadyExist = async (payload, session = null) => {
    return await this.SessionManager.executeQueryHookWithSession(this.Admin.findOne({
        email: payload.email,
      })
      .populate({
        path: "identity"
      })
      .includeDeleted(), session)
  };
  /**
   * @findOrCreate
   */
  findOrCreate = async (payload, session = null) => {
    const adminExist = await this.instanceAlreadyExist(payload, session)

    let save
    if (adminExist) {
      save = adminExist
    } else {
      save = await this.create(payload, session)
    }
    return save
  };
  /**
   * @create
   */
  create = async (payload, session = null) => {
    return this.SessionManager.executeCallbackInTransaction(async (session) => {
      const options = session ? {
        session
      } : {}

      const identity = await this.AuthServices.createIdentity({
        firstName: payload.firstName,
        lastName: payload.lastName,
        password: payload.password,
        actorType: "admin",
        identifier: payload.email,
        identifierType: this.AuthIdentityEnum.IDENTIFIER_TYPES.EMAIL.KEY,
        shouldSkipVerificationCode: payload.shouldSkipVerificationCode || false,
      }, session)


      const schema = {}
      if (this.HelperMethods.issetData(payload.firstName)) {
        schema.firstName = this.HelperMethods.getValidTrimData(payload.firstName);
      }
      if (this.HelperMethods.issetData(payload.lastName)) {
        schema.lastName = this.HelperMethods.getValidTrimData(payload.lastName);
      }
      if (this.HelperMethods.issetData(payload.email)) {
        const emailExistForAdmin = await this.SessionManager.executeQueryHookWithSession(this.Admin.findOne({
          email: payload.email
        }), session)
        if (emailExistForAdmin) throw new this.ApiError("this email already exists")

        schema.email = this.HelperMethods.getValidTrimData(payload.email);
      }
      if (this.HelperMethods.issetData(payload.roles)) {

        schema.roles = this.HelperMethods.getValidTrimData(payload.roles);


      }


      schema.identity = identity._id
      schema.isActive = identity.isActive
      const admin = new this.Admin(schema);
      const save = await admin.save(options);


      return save
    }, session)
  };
  /**
   * @update
   */
  update = async (query, payload, profile, session = null) => {
    const options = session ? {
      session
    } : {
      new: true
    };

    const admin = await this.Admin.findOne(query);

    if (!admin) throw new this.NotFoundError(this.ERROR_MESSAGES.CAN_NOT_FIND('this admin'))

    const schema = {}
    if (this.HelperMethods.issetData(payload.firstName)) {
      schema.firstName = this.HelperMethods.getValidTrimData(payload.firstName);
    }
    if (this.HelperMethods.issetData(payload.lastName)) {
      schema.lastName = this.HelperMethods.getValidTrimData(payload.lastName);
    }
    if (this.HelperMethods.issetData(payload.email)) {
      const emailExistForAdmin = await this.SessionManager.executeQueryHookWithSession(this.Admin.findOne({
        _id: {
          $ne: admin._id
        },
        email: payload.email
      }), session)
      if (emailExistForAdmin) throw new this.ApiError("this email already exists")

      schema.email = this.HelperMethods.getValidTrimData(payload.email);
    }
    if (this.HelperMethods.issetData(payload.roles)) {

      schema.roles = this.HelperMethods.getValidTrimData(payload.roles);


    }


    const data = await this.Admin.findOneAndUpdate({
        _id: admin._id
      },
      schema, options
    );



    return data
  };
  /**
   * @updateProfile
   */
  updateProfile = async (payload, profile, session = null) => {
    const options = session ? {
      session
    } : {
      new: true
    };

    const admin = await this.Admin.findOne({
      _id: profile._id
    });

    if (!admin) throw new this.NotFoundError(this.ERROR_MESSAGES.CAN_NOT_FIND('this admin'))

    const schema = {}
    if (this.HelperMethods.issetData(payload.firstName)) {
      schema.firstName = this.HelperMethods.getValidTrimData(payload.firstName);
    }
    if (this.HelperMethods.issetData(payload.lastName)) {
      schema.lastName = this.HelperMethods.getValidTrimData(payload.lastName);
    }
    if (this.HelperMethods.issetData(payload.email)) {
      const emailExistForAdmin = await this.SessionManager.executeQueryHookWithSession(this.Admin.findOne({
        _id: {
          $ne: admin._id
        },
        email: payload.email
      }), session)
      if (emailExistForAdmin) throw new this.ApiError("this email already exists")

      schema.email = this.HelperMethods.getValidTrimData(payload.email);
    }
    if (this.HelperMethods.issetData(payload.roles)) {

      schema.roles = this.HelperMethods.getValidTrimData(payload.roles);


    }


    const data = await this.Admin.findOneAndUpdate({
        _id: admin._id
      },
      schema, options
    );





    return data
  };
  /**
   * @delete
   */
  delete = async (query, profile, session = null) => {
    const admin = await this.Admin.findOne(query);

    if (!admin) throw new this.NotFoundError(this.ERROR_MESSAGES.CAN_NOT_FIND('this admin'))

    await admin.softDelete(profile._id, session);

    return admin
  };
  /**
   * @deleteProfile
   */
  deleteProfile = async (profile, session = null) => {
    const admin = await this.Admin.findOne({
      _id: profile._id
    });
    if (!admin) throw new this.NotFoundError(this.ERROR_MESSAGES.CAN_NOT_FIND('this admin'))

    await admin.softDelete(profile._id, session);

    return admin
  };
  /**
   * @findById
   */
  findById = async (id, session = null) => {
    const admin = await this.SessionManager.executeQueryHookWithSession(this.Admin.findOne({
      _id: id
    }), session)

    if (!admin) throw new this.NotFoundError(this.ERROR_MESSAGES.CAN_NOT_FIND('this admin'))

    return await this.AdminResources.ref(admin)
  };
  /**
   * @getList
   */
  getList = async (querySchema, match = {
    matchIdentity: {}
  }, session = null) => {
    const {
      matchIdentity,
    } = match
    const data = []
    const adminFindData = await this.SessionManager.executeQueryHookWithSession(this.Admin.find(querySchema).populate({
      path: "identity",
      match: matchIdentity
    }), session)


    for (const item of adminFindData) {
      if (item
        //&&item.identity
      ) {
        data.push(await this.AdminResources.collection(item))
      }
    }

    return data
  };
  /**
   * @findOne
   */
  findOne = async (querySchema, session = null) => {
    let data = null
    const adminFindOneData = await this.SessionManager.executeQueryHookWithSession(this.Admin.findOne(querySchema).populate({
      path: "identity",
    }), session)

    if (adminFindOneData) {
      data = await this.AdminResources.collection(adminFindOneData)
    }
    return data
  };
  /**
   * @getPaginatedList
   */
  getPaginatedList = async (inputPipeline, options) => {
    const {
      perPage,
      page,
      route,
      query,
      countDocumentSchema
    } = options
    const servicePipeline = [{
        $lookup: {
          from: "authidentities",
          localField: "identity",
          foreignField: "_id",
          as: "identity"
        }
      },

      {
        $addFields: {
          identity: {
            $ifNull: [{
              $arrayElemAt: ['$identity', 0]
            }, null]
          }
        }
      },
      {
        $unwind: {
          path: '$identity',
          preserveNullAndEmptyArrays: true
        }
      },

    ];
    const paginationResponse = await this.getPaginateAggregateDataService({
      Model: this.Admin,
      perPage: perPage,
      page: page,
      query: query,
      route: route,
      pipeline: servicePipeline.concat(inputPipeline),
      countDocumentSchema: countDocumentSchema
    })

    const response = paginationResponse.data

    const data = await Promise.all(
      response.map(item => this.AdminResources.collection(item))
    );

    return {
      "page": Number(page),
      "totalPages": paginationResponse.totalPages,
      "totalItems": paginationResponse.totalItems,
      "perPage": perPage,
      "nextLink": paginationResponse.nextLink,
      "prevLink": paginationResponse.prevLink,
      "data": data
    }
  };

}