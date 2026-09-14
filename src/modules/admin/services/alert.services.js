/**
 * @AlertServices
 */

const CoreServices = require("../../../shared/services/core.services")
module.exports = class AlertServices extends CoreServices {

  constructor() {
    super();
    this.Alert = require("../../admin/models/alert.model");
    this.AlertResources = require("../../admin/resources/alert.resources");
    this.SharedAdminServices = new(require("../../admin/services/shared.admin.services"))();
  }
  /**
   * @instanceAlreadyExist
   */
  instanceAlreadyExist = async (payload, session = null) => {
    return await this.SessionManager.executeQueryHookWithSession(this.Alert.findOne({
      // your condition
      name: payload.name,
    }), session)
  };
  /**
   * @findOrCreate
   */
  findOrCreate = async (payload, session = null) => {
    const alertExist = await this.instanceAlreadyExist(payload, session)

    let save
    if (alertExist) {
      save = alertExist
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

    if (this.HelperMethods.issetData(payload.gps_id)) {
      const gps_id = await this.SharedAdminServices.findGPSById(this.HelperMethods.getValidTrimData(payload.gps_id), session)
      if (!gps_id) throw new this.NotFoundError(this.ERROR_MESSAGES.CAN_NOT_FIND("this gps_id"));

      schema.gps_id = this.HelperMethods.getValidTrimData(payload.gps_id);
    }

    if (this.HelperMethods.issetData(payload.alert_type)) {
      schema.alert_type = this.HelperMethods.getValidTrimData(payload.alert_type);
    }
    if (this.HelperMethods.issetData(payload.seuil)) {
      schema.seuil = this.HelperMethods.getValidTrimData(payload.seuil);
    }
    if (this.HelperMethods.issetData(payload.date_generation)) {
      schema.date_generation = this.HelperMethods.getValidTrimData(payload.date_generation);
    }
    if (this.HelperMethods.issetData(payload.status)) {
      schema.status = this.HelperMethods.getValidTrimData(payload.status);
    }
    if (this.HelperMethods.issetData(payload.message)) {
      schema.message = this.HelperMethods.getValidTrimData(payload.message);
    }


    const alert = new this.Alert(schema);
    const save = await alert.save(options);

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

    const alert = await this.SessionManager.executeQueryHookWithSession(this.Alert.findOne(query), session);

    if (!alert) throw new this.NotFoundError(this.ERROR_MESSAGES.CAN_NOT_FIND('this alert'))

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

    if (this.HelperMethods.issetData(payload.gps_id)) {
      const gps_id = await this.SharedAdminServices.findGPSById(this.HelperMethods.getValidTrimData(payload.gps_id), session)
      if (!gps_id) throw new this.NotFoundError(this.ERROR_MESSAGES.CAN_NOT_FIND("this gps_id"));

      schema.gps_id = this.HelperMethods.getValidTrimData(payload.gps_id);
    }

    if (this.HelperMethods.issetData(payload.alert_type)) {
      schema.alert_type = this.HelperMethods.getValidTrimData(payload.alert_type);
    }
    if (this.HelperMethods.issetData(payload.seuil)) {
      schema.seuil = this.HelperMethods.getValidTrimData(payload.seuil);
    }
    if (this.HelperMethods.issetData(payload.date_generation)) {
      schema.date_generation = this.HelperMethods.getValidTrimData(payload.date_generation);
    }
    if (this.HelperMethods.issetData(payload.status)) {
      schema.status = this.HelperMethods.getValidTrimData(payload.status);
    }
    if (this.HelperMethods.issetData(payload.message)) {
      schema.message = this.HelperMethods.getValidTrimData(payload.message);
    }


    const data = await this.Alert.findOneAndUpdate({
        _id: alert._id
      },
      schema, options
    );



    return data
  };
  /**
   * @delete
   */
  delete = async (query, session = null) => {
    const alert = await this.SessionManager.executeQueryHookWithSession(this.Alert.findOne(query), session);

    if (!alert) throw new this.NotFoundError(this.ERROR_MESSAGES.CAN_NOT_FIND('this alert'))

    await alert.softDelete(undefined, session);

    return alert
  };
  /**
   * @findById
   */
  findById = async (id, session = null) => {
    const alert = await this.SessionManager.executeQueryHookWithSession(this.Alert.findOne({
      _id: id
    }), session)

    if (!alert) throw new this.NotFoundError(this.ERROR_MESSAGES.CAN_NOT_FIND('this alert'))

    return await this.AlertResources.ref(alert)
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
    const alertFindData = await this.SessionManager.executeQueryHookWithSession(this.Alert.find(querySchema).populate({
      path: "gps_id",
      match: matchGps_id
    }), session)

    for (const item of alertFindData) {
      if (item
        //&&item.gps_id
      ) {
        data.push(await this.AlertResources.collection(item))
      }
    }

    return data
  };
  /**
   * @findOne
   */
  findOne = async (querySchema, session = null) => {
    let data = null

    const alertFindOneData = await this.SessionManager.executeQueryHookWithSession(this.Alert.findOne(querySchema).populate({
      path: "gps_id",
    }), session)

    if (alertFindOneData) {
      data = await this.AlertResources.collection(alertFindOneData)
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
      Model: this.Alert,
      perPage: perPage,
      page: page,
      query: query,
      route: route,
      pipeline: servicePipeline.concat(inputPipeline),
      countDocumentSchema: countDocumentSchema

    })

    const response = paginationResponse.data

    const data = await Promise.all(
      response.map(item => this.AlertResources.collection(item))
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