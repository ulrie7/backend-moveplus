/**
 * @GPSServices
 */

const CoreServices = require("../../../shared/services/core.services")
module.exports = class GPSServices extends CoreServices {

  constructor() {
    super();
    this.GPS = require("../../admin/models/gps.model");
    this.GPSResources = require("../../admin/resources/gps.resources");
    this.SharedAdminServices = new(require("../../admin/services/shared.admin.services"))();
  }
  /**
   * @instanceAlreadyExist
   */
  instanceAlreadyExist = async (payload, session = null) => {
    return await this.SessionManager.executeQueryHookWithSession(this.GPS.findOne({
      // your condition
      name: payload.name,
    }), session)
  };
  /**
   * @findOrCreate
   */
  findOrCreate = async (payload, session = null) => {
    const gpsExist = await this.instanceAlreadyExist(payload, session)

    let save
    if (gpsExist) {
      save = gpsExist
    } else {
      save = await this.create(payload, session)
    }

    return save
  };
  /**
   * @create
   */
  create = async (payload, session = null) => {
    const options = session ? {
      session
    } : {}

    const schema = {}
    if (this.HelperMethods.issetData(payload.createdBy)) {
      schema.createdBy = this.HelperMethods.getValidTrimData(payload.createdBy);
    }

    if (this.HelperMethods.issetData(payload.updatedBy)) {
      schema.updatedBy = this.HelperMethods.getValidTrimData(payload.updatedBy);
    }

    if (this.HelperMethods.issetData(payload.deletedBy)) {
      schema.deletedBy = this.HelperMethods.getValidTrimData(payload.deletedBy);
    }

    if (this.HelperMethods.issetData(payload.imei)) {
      schema.imei = this.HelperMethods.getValidTrimData(payload.imei);
    }
    if (this.HelperMethods.issetData(payload.status)) {
      schema.status = this.HelperMethods.getValidTrimData(payload.status);
    }
    if (this.HelperMethods.issetData(payload.battery)) {

      schema.battery = this.HelperMethods.getValidTrimData(payload.battery);


    }
    if (this.HelperMethods.issetData(payload.brand)) {
      schema.brand = this.HelperMethods.getValidTrimData(payload.brand);
    }
    if (this.HelperMethods.issetData(payload.last_connexion)) {
      schema.last_connexion = this.HelperMethods.getValidTrimData(payload.last_connexion);
    }
    if (this.HelperMethods.issetData(payload.model_device)) {
      schema.model_device = this.HelperMethods.getValidTrimData(payload.model_device);
    }
    if (this.HelperMethods.issetData(payload.vehicle_id)) {
      const vehicle_id = await this.SharedAdminServices.findVehicleById(this.HelperMethods.getValidTrimData(payload.vehicle_id), session)
      if (!vehicle_id) throw new this.NotFoundError(this.ERROR_MESSAGES.CAN_NOT_FIND("this vehicle_id"));

      schema.vehicle_id = this.HelperMethods.getValidTrimData(payload.vehicle_id);
    }



    const gps = new this.GPS(schema);
    const save = await gps.save(options);

    return save
  };
  /**
   * @update
   */
  update = async (query, payload, session = null) => {
    const options = session ? {
      session
    } : {
      new: true
    };

    const gps = await this.SessionManager.executeQueryHookWithSession(this.GPS.findOne(query), session);

    if (!gps) throw new this.NotFoundError(this.ERROR_MESSAGES.CAN_NOT_FIND('this gps'))

    const schema = {}
    if (this.HelperMethods.issetData(payload.createdBy)) {
      schema.createdBy = this.HelperMethods.getValidTrimData(payload.createdBy);
    }

    if (this.HelperMethods.issetData(payload.updatedBy)) {
      schema.updatedBy = this.HelperMethods.getValidTrimData(payload.updatedBy);
    }

    if (this.HelperMethods.issetData(payload.deletedBy)) {
      schema.deletedBy = this.HelperMethods.getValidTrimData(payload.deletedBy);
    }

    if (this.HelperMethods.issetData(payload.imei)) {
      schema.imei = this.HelperMethods.getValidTrimData(payload.imei);
    }
    if (this.HelperMethods.issetData(payload.status)) {
      schema.status = this.HelperMethods.getValidTrimData(payload.status);
    }
    if (this.HelperMethods.issetData(payload.battery)) {

      schema.battery = this.HelperMethods.getValidTrimData(payload.battery);


    }
    if (this.HelperMethods.issetData(payload.brand)) {
      schema.brand = this.HelperMethods.getValidTrimData(payload.brand);
    }
    if (this.HelperMethods.issetData(payload.last_connexion)) {
      schema.last_connexion = this.HelperMethods.getValidTrimData(payload.last_connexion);
    }
    if (this.HelperMethods.issetData(payload.model_device)) {
      schema.model_device = this.HelperMethods.getValidTrimData(payload.model_device);
    }
    if (this.HelperMethods.issetData(payload.vehicle_id)) {
      const vehicle_id = await this.SharedAdminServices.findVehicleById(this.HelperMethods.getValidTrimData(payload.vehicle_id), session)
      if (!vehicle_id) throw new this.NotFoundError(this.ERROR_MESSAGES.CAN_NOT_FIND("this vehicle_id"));

      schema.vehicle_id = this.HelperMethods.getValidTrimData(payload.vehicle_id);
    }



    const data = await this.GPS.findOneAndUpdate({
        _id: gps._id
      },
      schema, options
    );



    return data
  };
  /**
   * @delete
   */
  delete = async (query, session = null) => {
    const gps = await this.SessionManager.executeQueryHookWithSession(this.GPS.findOne(query), session);

    if (!gps) throw new this.NotFoundError(this.ERROR_MESSAGES.CAN_NOT_FIND('this gps'))

    await gps.softDelete(undefined, session);

    return gps
  };
  /**
   * @findById
   */
  findById = async (id, session = null) => {
    const gps = await this.SessionManager.executeQueryHookWithSession(this.GPS.findOne({
      _id: id
    }), session)

    if (!gps) throw new this.NotFoundError(this.ERROR_MESSAGES.CAN_NOT_FIND('this gps'))

    return await this.GPSResources.ref(gps)
  };
  /**
   * @getList
   */
  getList = async (querySchema, match = {
    matchVehicle_id: {}
  }, session = null) => {
    const {
      matchVehicle_id,
    } = match
    const data = []
    const gpsFindData = await this.SessionManager.executeQueryHookWithSession(this.GPS.find(querySchema).populate({
      path: "vehicle_id",
      match: matchVehicle_id
    }), session)

    for (const item of gpsFindData) {
      if (item
        //&&item.vehicle_id
      ) {
        data.push(await this.GPSResources.collection(item))
      }
    }

    return data
  };
  /**
   * @findOne
   */
  findOne = async (querySchema, session = null) => {
    let data = null

    const gpsFindOneData = await this.SessionManager.executeQueryHookWithSession(this.GPS.findOne(querySchema).populate({
      path: "vehicle_id",
    }), session)

    if (gpsFindOneData) {
      data = await this.GPSResources.collection(gpsFindOneData)
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
          from: "vehicles",
          localField: "vehicle_id",
          foreignField: "_id",
          as: "vehicle_id"
        }
      },

      {
        $addFields: {
          vehicle_id: {
            $ifNull: [{
              $arrayElemAt: ['$vehicle_id', 0]
            }, null]
          }
        }
      },
      {
        $unwind: {
          path: '$vehicle_id',
          preserveNullAndEmptyArrays: true
        }
      },

    ];
    const paginationResponse = await this.getPaginateAggregateDataService({
      Model: this.GPS,
      perPage: perPage,
      page: page,
      query: query,
      route: route,
      pipeline: servicePipeline.concat(inputPipeline),
      countDocumentSchema: countDocumentSchema

    })

    const response = paginationResponse.data

    const data = await Promise.all(
      response.map(item => this.GPSResources.collection(item))
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