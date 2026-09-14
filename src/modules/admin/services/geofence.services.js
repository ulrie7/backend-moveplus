/**
 * @GeofenceServices
 */

const CoreServices = require("../../../shared/services/core.services")
module.exports = class GeofenceServices extends CoreServices {

  constructor() {
    super();
    this.Geofence = require("../../admin/models/geofence.model");
    this.GeofenceResources = require("../../admin/resources/geofence.resources");
    this.SharedAdminServices = new(require("../../admin/services/shared.admin.services"))();
  }
  /**
   * @instanceAlreadyExist
   */
  instanceAlreadyExist = async (payload, session = null) => {
    return await this.SessionManager.executeQueryHookWithSession(this.Geofence.findOne({
      // your condition
      name: payload.name,
    }), session)
  };
  /**
   * @findOrCreate
   */
  findOrCreate = async (payload, session = null) => {
    const geofenceExist = await this.instanceAlreadyExist(payload, session)

    let save
    if (geofenceExist) {
      save = geofenceExist
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

    if (this.HelperMethods.issetData(payload.zone_name)) {
      schema.zone_name = this.HelperMethods.getValidTrimData(payload.zone_name);
    }
    if (this.HelperMethods.issetData(payload.type_zone)) {
      schema.type_zone = this.HelperMethods.getValidTrimData(payload.type_zone);
    }
    if (this.HelperMethods.issetData(payload.coordinates)) {
      schema.coordinates = this.HelperMethods.getValidTrimData(payload.coordinates);
    }
    if (this.HelperMethods.issetData(payload.perimeter)) {

      schema.perimeter = this.HelperMethods.getValidTrimData(payload.perimeter);


    }
    if (this.HelperMethods.issetData(payload.statut)) {

      schema.statut = this.HelperMethods.getValidTrimData(payload.statut);


    }
    if (this.HelperMethods.issetData(payload.vehicle_id)) {
      const vehicle_id = await this.SharedAdminServices.findVehicleById(this.HelperMethods.getValidTrimData(payload.vehicle_id), session)
      if (!vehicle_id) throw new this.NotFoundError(this.ERROR_MESSAGES.CAN_NOT_FIND("this vehicle_id"));

      schema.vehicle_id = this.HelperMethods.getValidTrimData(payload.vehicle_id);
    }



    const geofence = new this.Geofence(schema);
    const save = await geofence.save(options);

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

    const geofence = await this.SessionManager.executeQueryHookWithSession(this.Geofence.findOne(query), session);

    if (!geofence) throw new this.NotFoundError(this.ERROR_MESSAGES.CAN_NOT_FIND('this geofence'))

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

    if (this.HelperMethods.issetData(payload.zone_name)) {
      schema.zone_name = this.HelperMethods.getValidTrimData(payload.zone_name);
    }
    if (this.HelperMethods.issetData(payload.type_zone)) {
      schema.type_zone = this.HelperMethods.getValidTrimData(payload.type_zone);
    }
    if (this.HelperMethods.issetData(payload.coordinates)) {
      schema.coordinates = this.HelperMethods.getValidTrimData(payload.coordinates);
    }
    if (this.HelperMethods.issetData(payload.perimeter)) {

      schema.perimeter = this.HelperMethods.getValidTrimData(payload.perimeter);


    }
    if (this.HelperMethods.issetData(payload.statut)) {

      schema.statut = this.HelperMethods.getValidTrimData(payload.statut);


    }
    if (this.HelperMethods.issetData(payload.vehicle_id)) {
      const vehicle_id = await this.SharedAdminServices.findVehicleById(this.HelperMethods.getValidTrimData(payload.vehicle_id), session)
      if (!vehicle_id) throw new this.NotFoundError(this.ERROR_MESSAGES.CAN_NOT_FIND("this vehicle_id"));

      schema.vehicle_id = this.HelperMethods.getValidTrimData(payload.vehicle_id);
    }



    const data = await this.Geofence.findOneAndUpdate({
        _id: geofence._id
      },
      schema, options
    );



    return data
  };
  /**
   * @delete
   */
  delete = async (query, session = null) => {
    const geofence = await this.SessionManager.executeQueryHookWithSession(this.Geofence.findOne(query), session);

    if (!geofence) throw new this.NotFoundError(this.ERROR_MESSAGES.CAN_NOT_FIND('this geofence'))

    await geofence.softDelete(undefined, session);

    return geofence
  };
  /**
   * @findById
   */
  findById = async (id, session = null) => {
    const geofence = await this.SessionManager.executeQueryHookWithSession(this.Geofence.findOne({
      _id: id
    }), session)

    if (!geofence) throw new this.NotFoundError(this.ERROR_MESSAGES.CAN_NOT_FIND('this geofence'))

    return await this.GeofenceResources.ref(geofence)
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
    const geofenceFindData = await this.SessionManager.executeQueryHookWithSession(this.Geofence.find(querySchema).populate({
      path: "vehicle_id",
      match: matchVehicle_id
    }), session)

    for (const item of geofenceFindData) {
      if (item
        //&&item.vehicle_id
      ) {
        data.push(await this.GeofenceResources.collection(item))
      }
    }

    return data
  };
  /**
   * @findOne
   */
  findOne = async (querySchema, session = null) => {
    let data = null

    const geofenceFindOneData = await this.SessionManager.executeQueryHookWithSession(this.Geofence.findOne(querySchema).populate({
      path: "vehicle_id",
    }), session)

    if (geofenceFindOneData) {
      data = await this.GeofenceResources.collection(geofenceFindOneData)
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
      Model: this.Geofence,
      perPage: perPage,
      page: page,
      query: query,
      route: route,
      pipeline: servicePipeline.concat(inputPipeline),
      countDocumentSchema: countDocumentSchema

    })

    const response = paginationResponse.data

    const data = await Promise.all(
      response.map(item => this.GeofenceResources.collection(item))
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