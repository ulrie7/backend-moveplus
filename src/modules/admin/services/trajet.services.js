/**
 * @TrajetServices
 */

const CoreServices = require("../../../shared/services/core.services")
module.exports = class TrajetServices extends CoreServices {

  constructor() {
    super();
    this.Trajet = require("../../admin/models/trajet.model");
    this.RouteResources = require("../../admin/resources/trajet.resources");
    this.SharedAdminServices = new(require("../../admin/services/shared.admin.services"))();
  }
  /**
   * @instanceAlreadyExist
   */
  instanceAlreadyExist = async (payload, session = null) => {
    return await this.SessionManager.executeQueryHookWithSession(this.Trajet.findOne({
      // your condition
      name: payload.name,
    }), session)
  };
  /**
   * @findOrCreate
   */
  findOrCreate = async (payload, session = null) => {
    const trajetExist = await this.instanceAlreadyExist(payload, session)

    let save
    if (trajetExist) {
      save = trajetExist
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

    if (this.HelperMethods.issetData(payload.date_start)) {
      schema.date_start = this.HelperMethods.getValidTrimData(payload.date_start);
    }
    if (this.HelperMethods.issetData(payload.date_end)) {
      schema.date_end = this.HelperMethods.getValidTrimData(payload.date_end);
    }
    if (this.HelperMethods.issetData(payload.stop_time)) {

      schema.stop_time = this.HelperMethods.getValidTrimData(payload.stop_time);


    }
    if (this.HelperMethods.issetData(payload.stop_nb)) {

      schema.stop_nb = this.HelperMethods.getValidTrimData(payload.stop_nb);


    }
    if (this.HelperMethods.issetData(payload.status)) {
      schema.status = this.HelperMethods.getValidTrimData(payload.status);
    }
    if (this.HelperMethods.issetData(payload.vehicle_id)) {
      const vehicle_id = await this.SharedAdminServices.findVehicleById(this.HelperMethods.getValidTrimData(payload.vehicle_id), session)
      if (!vehicle_id) throw new this.NotFoundError(this.ERROR_MESSAGES.CAN_NOT_FIND("this vehicle_id"));

      schema.vehicle_id = this.HelperMethods.getValidTrimData(payload.vehicle_id);
    }

    if (this.HelperMethods.issetData(payload.distance)) {

      schema.distance = this.HelperMethods.getValidTrimData(payload.distance);


    }
    if (this.HelperMethods.issetData(payload.average_speed)) {

      schema.average_speed = this.HelperMethods.getValidTrimData(payload.average_speed);


    }
    if (this.HelperMethods.issetData(payload.max_speed)) {

      schema.max_speed = this.HelperMethods.getValidTrimData(payload.max_speed);


    }


    const trajet = new this.Trajet(schema);
    const save = await trajet.save(options);

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

    const trajet = await this.SessionManager.executeQueryHookWithSession(this.Trajet.findOne(query), session);

    if (!trajet) throw new this.NotFoundError(this.ERROR_MESSAGES.CAN_NOT_FIND('this trajet'))

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

    if (this.HelperMethods.issetData(payload.date_start)) {
      schema.date_start = this.HelperMethods.getValidTrimData(payload.date_start);
    }
    if (this.HelperMethods.issetData(payload.date_end)) {
      schema.date_end = this.HelperMethods.getValidTrimData(payload.date_end);
    }
    if (this.HelperMethods.issetData(payload.stop_time)) {

      schema.stop_time = this.HelperMethods.getValidTrimData(payload.stop_time);


    }
    if (this.HelperMethods.issetData(payload.stop_nb)) {

      schema.stop_nb = this.HelperMethods.getValidTrimData(payload.stop_nb);


    }
    if (this.HelperMethods.issetData(payload.status)) {
      schema.status = this.HelperMethods.getValidTrimData(payload.status);
    }
    if (this.HelperMethods.issetData(payload.vehicle_id)) {
      const vehicle_id = await this.SharedAdminServices.findVehicleById(this.HelperMethods.getValidTrimData(payload.vehicle_id), session)
      if (!vehicle_id) throw new this.NotFoundError(this.ERROR_MESSAGES.CAN_NOT_FIND("this vehicle_id"));

      schema.vehicle_id = this.HelperMethods.getValidTrimData(payload.vehicle_id);
    }

    if (this.HelperMethods.issetData(payload.distance)) {

      schema.distance = this.HelperMethods.getValidTrimData(payload.distance);


    }
    if (this.HelperMethods.issetData(payload.average_speed)) {

      schema.average_speed = this.HelperMethods.getValidTrimData(payload.average_speed);


    }
    if (this.HelperMethods.issetData(payload.max_speed)) {

      schema.max_speed = this.HelperMethods.getValidTrimData(payload.max_speed);


    }


    const data = await this.Trajet.findOneAndUpdate({
        _id: trajet._id
      },
      schema, options
    );



    return data
  };
  /**
   * @delete
   */
  delete = async (query, session = null) => {
    const trajet = await this.SessionManager.executeQueryHookWithSession(this.Trajet.findOne(query), session);

    if (!trajet) throw new this.NotFoundError(this.ERROR_MESSAGES.CAN_NOT_FIND('this trajet'))

    await trajet.softDelete(undefined, session);

    return trajet
  };
  /**
   * @findById
   */
  findById = async (id, session = null) => {
    const trajet = await this.SessionManager.executeQueryHookWithSession(this.Trajet.findOne({
      _id: id
    }), session)

    if (!trajet) throw new this.NotFoundError(this.ERROR_MESSAGES.CAN_NOT_FIND('this trajet'))

    return await this.RouteResources.ref(trajet)
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
    const trajetFindData = await this.SessionManager.executeQueryHookWithSession(this.Trajet.find(querySchema).populate({
      path: "vehicle_id",
      match: matchVehicle_id
    }), session)

    for (const item of trajetFindData) {
      if (item
        //&&item.vehicle_id
      ) {
        data.push(await this.RouteResources.collection(item))
      }
    }

    return data
  };
  /**
   * @findOne
   */
  findOne = async (querySchema, session = null) => {
    let data = null

    const trajetFindOneData = await this.SessionManager.executeQueryHookWithSession(this.Trajet.findOne(querySchema).populate({
      path: "vehicle_id",
    }), session)

    if (trajetFindOneData) {
      data = await this.RouteResources.collection(trajetFindOneData)
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
      Model: this.Trajet,
      perPage: perPage,
      page: page,
      query: query,
      route: route,
      pipeline: servicePipeline.concat(inputPipeline),
      countDocumentSchema: countDocumentSchema

    })

    const response = paginationResponse.data

    const data = await Promise.all(
      response.map(item => this.RouteResources.collection(item))
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