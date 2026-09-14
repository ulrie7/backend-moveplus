/**
 * @VehicleServices
 */

const CoreServices = require("../../../shared/services/core.services")
module.exports = class VehicleServices extends CoreServices {

  constructor() {
    super();
    this.Vehicle = require("../../admin/models/vehicule.model");
    this.VehicleResources = require("../../admin/resources/vehicule.resources");
    this.SharedAdminServices = new(require("../../admin/services/shared.admin.services"))();
  }
  /**
   * @instanceAlreadyExist
   */
  instanceAlreadyExist = async (payload, session = null) => {
    return await this.SessionManager.executeQueryHookWithSession(this.Vehicle.findOne({
      // your condition
      name: payload.name,
    }), session)
  };
  /**
   * @findOrCreate
   */
  findOrCreate = async (payload, session = null) => {
    const vehicleExist = await this.instanceAlreadyExist(payload, session)

    let save
    if (vehicleExist) {
      save = vehicleExist
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
    if (this.HelperMethods.issetData(payload.immatriculation)) {
      schema.immatriculation = this.HelperMethods.getValidTrimData(payload.immatriculation);
    }
    if (this.HelperMethods.issetData(payload.type_vehicule)) {
      schema.type_vehicule = this.HelperMethods.getValidTrimData(payload.type_vehicule);
    }
    if (this.HelperMethods.issetData(payload.brand)) {
      schema.brand = this.HelperMethods.getValidTrimData(payload.brand);
    }
    if (this.HelperMethods.issetData(payload.modele)) {
      schema.modele = this.HelperMethods.getValidTrimData(payload.modele);
    }
    if (this.HelperMethods.issetData(payload.color)) {
      schema.color = this.HelperMethods.getValidTrimData(payload.color);
    }
    if (this.HelperMethods.issetData(payload.year)) {

      schema.year = this.HelperMethods.getValidTrimData(JSON.parse(payload.year));


    }
    if (this.HelperMethods.issetData(payload.status)) {
      schema.status = this.HelperMethods.getValidTrimData(payload.status);
    }
    if (this.HelperMethods.issetData(payload.gps_id)) {
      const gps_id = await this.SharedAdminServices.findGPSById(this.HelperMethods.getValidTrimData(payload.gps_id), session)
      if (!gps_id) throw new this.NotFoundError(this.ERROR_MESSAGES.CAN_NOT_FIND("this gps_id"));

      schema.gps_id = this.HelperMethods.getValidTrimData(payload.gps_id);
    }

    if (this.HelperMethods.issetData(payload.coordinates)) {
        try {
            schema.coordinates = JSON.parse(payload.coordinates);
        } catch (e) {
            throw new this.ValidationError("Coordinates must be a valid JSON string.");
        }
    }

    if (this.HelperMethods.issetData(payload.image)) {

      schema.image = this.HelperMethods.getValidTrimData(payload.image);

    }


    const vehicle = new this.Vehicle(schema);
    const save = await vehicle.save(options);

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
    const oldPaths = [];

    const vehicle = await this.SessionManager.executeQueryHookWithSession(this.Vehicle.findOne(query), session);

    if (!vehicle) throw new this.NotFoundError(this.ERROR_MESSAGES.CAN_NOT_FIND('this vehicle'))

    const schema = {}
    if (this.HelperMethods.issetData(payload.immatriculation)) {
      schema.immatriculation = this.HelperMethods.getValidTrimData(payload.immatriculation);
    }
    if (this.HelperMethods.issetData(payload.type_vehicule)) {
      schema.type_vehicule = this.HelperMethods.getValidTrimData(payload.type_vehicule);
    }
    if (this.HelperMethods.issetData(payload.brand)) {
      schema.brand = this.HelperMethods.getValidTrimData(payload.brand);
    }
    if (this.HelperMethods.issetData(payload.modele)) {
      schema.modele = this.HelperMethods.getValidTrimData(payload.modele);
    }
    if (this.HelperMethods.issetData(payload.color)) {
      schema.color = this.HelperMethods.getValidTrimData(payload.color);
    }
    if (this.HelperMethods.issetData(payload.year)) {

      schema.year = this.HelperMethods.getValidTrimData(JSON.parse(payload.year));


    }
    if (this.HelperMethods.issetData(payload.status)) {
      schema.status = this.HelperMethods.getValidTrimData(payload.status);
    }
    if (this.HelperMethods.issetData(payload.gps_id)) {
      const gps_id = await this.SharedAdminServices.findGPSById(this.HelperMethods.getValidTrimData(payload.gps_id), session)
      if (!gps_id) throw new this.NotFoundError(this.ERROR_MESSAGES.CAN_NOT_FIND("this gps_id"));

      schema.gps_id = this.HelperMethods.getValidTrimData(payload.gps_id);
    }

    if (this.HelperMethods.issetData(payload.coordinates)) {
      try {
        schema.coordinates = JSON.parse(payload.coordinates);
      } catch (e) {
        throw new this.ValidationError("Coordinates must be a valid JSON string.");
      }
    }

    if (this.HelperMethods.issetData(payload.image)) {

      schema.image = this.HelperMethods.getValidTrimData(payload.image);
      if (vehicle.image) {
        oldPaths.push(vehicle.image);
      }

    }


    const data = await this.Vehicle.findOneAndUpdate({
        _id: vehicle._id
      },
      schema, options
    );

    this.HelperMethods.deletePaths(oldPaths)


    return data
  };
  /**
   * @delete
   */
  delete = async (query, session = null) => {
    const oldPaths = [];

    const vehicle = await this.SessionManager.executeQueryHookWithSession(this.Vehicle.findOne(query), session);

    if (!vehicle) throw new this.NotFoundError(this.ERROR_MESSAGES.CAN_NOT_FIND('this vehicle'))
    if (vehicle.image) {
      oldPaths.push(vehicle.image);
    }

    await vehicle.softDelete(undefined, session);
    this.HelperMethods.deletePaths(oldPaths)

    return vehicle
  };
  /**
   * @findById
   */
  findById = async (id, session = null) => {
    const vehicle = await this.SessionManager.executeQueryHookWithSession(this.Vehicle.findOne({
      _id: id
    }), session)

    if (!vehicle) throw new this.NotFoundError(this.ERROR_MESSAGES.CAN_NOT_FIND('this vehicle'))

    return await this.VehicleResources.ref(vehicle)
  };
  /**
   * @getList
   */
  getList = async (querySchema, match = {
    matchGps_id: {}
  }, session = null) => {
    const {
      matchGps_id,
    } = match
    const data = []
    const vehicleFindData = await this.SessionManager.executeQueryHookWithSession(this.Vehicle.find(querySchema).populate({
      path: "gps_id",
      match: matchGps_id
    }), session)

    for (const item of vehicleFindData) {
      if (item
        //&&item.gps_id
      ) {
        data.push(await this.VehicleResources.collection(item))
      }
    }

    return data
  };
  /**
   * @findOne
   */
  findOne = async (querySchema, session = null) => {
    let data = null

    const vehicleFindOneData = await this.SessionManager.executeQueryHookWithSession(this.Vehicle.findOne(querySchema).populate({
      path: "gps_id",
    }), session)

    if (vehicleFindOneData) {
      data = await this.VehicleResources.collection(vehicleFindOneData)
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
          from: "gps",
          localField: "gps_id",
          foreignField: "_id",
          as: "gps_id"
        }
      },

      {
        $addFields: {
          gps_id: {
            $ifNull: [{
              $arrayElemAt: ['$gps_id', 0]
            }, null]
          }
        }
      },
      {
        $unwind: {
          path: '$gps_id',
          preserveNullAndEmptyArrays: true
        }
      },

    ];
    const paginationResponse = await this.getPaginateAggregateDataService({
      Model: this.Vehicle,
      perPage: perPage,
      page: page,
      query: query,
      route: route,
      pipeline: servicePipeline.concat(inputPipeline),
      countDocumentSchema: countDocumentSchema

    })

    const response = paginationResponse.data

    const data = await Promise.all(
      response.map(item => this.VehicleResources.collection(item))
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