/**
 * @ReportServices
 */

const CoreServices = require("../../../shared/services/core.services")
module.exports = class ReportServices extends CoreServices {

  constructor() {
    super();
    this.Report = require("../../admin/models/report.model");
    this.ReportResources = require("../../admin/resources/report.resources");
    this.SharedAdminServices = new(require("../../admin/services/shared.admin.services"))();
  }
  /**
   * @instanceAlreadyExist
   */
  instanceAlreadyExist = async (payload, session = null) => {
    return await this.SessionManager.executeQueryHookWithSession(this.Report.findOne({
      // your condition
      name: payload.name,
    }), session)
  };
  /**
   * @findOrCreate
   */
  findOrCreate = async (payload, session = null) => {
    const reportExist = await this.instanceAlreadyExist(payload, session)

    let save
    if (reportExist) {
      save = reportExist
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

    if (this.HelperMethods.issetData(payload.id_admin)) {
      const id_admin = await this.SharedAdminServices.findAdminById(this.HelperMethods.getValidTrimData(payload.id_admin), session)
      if (!id_admin) throw new this.NotFoundError(this.ERROR_MESSAGES.CAN_NOT_FIND("this id_admin"));

      schema.id_admin = this.HelperMethods.getValidTrimData(payload.id_admin);
    }

    if (this.HelperMethods.issetData(payload.id_vehicule)) {
      const id_vehicule = await this.SharedAdminServices.findVehicleById(this.HelperMethods.getValidTrimData(payload.id_vehicule), session)
      if (!id_vehicule) throw new this.NotFoundError(this.ERROR_MESSAGES.CAN_NOT_FIND("this id_vehicule"));

      schema.id_vehicule = this.HelperMethods.getValidTrimData(payload.id_vehicule);
    }

    if (this.HelperMethods.issetData(payload.report_type)) {
      schema.report_type = this.HelperMethods.getValidTrimData(payload.report_type);
    }
    if (this.HelperMethods.issetData(payload.date_generation)) {
      schema.date_generation = this.HelperMethods.getValidTrimData(payload.date_generation);
    }
    if (this.HelperMethods.issetData(payload.periode_debut)) {
      schema.periode_debut = this.HelperMethods.getValidTrimData(payload.periode_debut);
    }
    if (this.HelperMethods.issetData(payload.periode_fin)) {
      schema.periode_fin = this.HelperMethods.getValidTrimData(payload.periode_fin);
    }
    if (this.HelperMethods.issetData(payload.statut)) {
      schema.statut = this.HelperMethods.getValidTrimData(payload.statut);
    }


    const report = new this.Report(schema);
    const save = await report.save(options);

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

    const report = await this.SessionManager.executeQueryHookWithSession(this.Report.findOne(query), session);

    if (!report) throw new this.NotFoundError(this.ERROR_MESSAGES.CAN_NOT_FIND('this report'))

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

    if (this.HelperMethods.issetData(payload.id_admin)) {
      const id_admin = await this.SharedAdminServices.findAdminById(this.HelperMethods.getValidTrimData(payload.id_admin), session)
      if (!id_admin) throw new this.NotFoundError(this.ERROR_MESSAGES.CAN_NOT_FIND("this id_admin"));

      schema.id_admin = this.HelperMethods.getValidTrimData(payload.id_admin);
    }

    if (this.HelperMethods.issetData(payload.id_vehicule)) {
      const id_vehicule = await this.SharedAdminServices.findVehicleById(this.HelperMethods.getValidTrimData(payload.id_vehicule), session)
      if (!id_vehicule) throw new this.NotFoundError(this.ERROR_MESSAGES.CAN_NOT_FIND("this id_vehicule"));

      schema.id_vehicule = this.HelperMethods.getValidTrimData(payload.id_vehicule);
    }

    if (this.HelperMethods.issetData(payload.report_type)) {
      schema.report_type = this.HelperMethods.getValidTrimData(payload.report_type);
    }
    if (this.HelperMethods.issetData(payload.date_generation)) {
      schema.date_generation = this.HelperMethods.getValidTrimData(payload.date_generation);
    }
    if (this.HelperMethods.issetData(payload.periode_debut)) {
      schema.periode_debut = this.HelperMethods.getValidTrimData(payload.periode_debut);
    }
    if (this.HelperMethods.issetData(payload.periode_fin)) {
      schema.periode_fin = this.HelperMethods.getValidTrimData(payload.periode_fin);
    }
    if (this.HelperMethods.issetData(payload.statut)) {
      schema.statut = this.HelperMethods.getValidTrimData(payload.statut);
    }


    const data = await this.Report.findOneAndUpdate({
        _id: report._id
      },
      schema, options
    );



    return data
  };
  /**
   * @delete
   */
  delete = async (query, session = null) => {
    const report = await this.SessionManager.executeQueryHookWithSession(this.Report.findOne(query), session);

    if (!report) throw new this.NotFoundError(this.ERROR_MESSAGES.CAN_NOT_FIND('this report'))

    await report.softDelete(undefined, session);

    return report
  };
  /**
   * @findById
   */
  findById = async (id, session = null) => {
    const report = await this.SessionManager.executeQueryHookWithSession(this.Report.findOne({
      _id: id
    }), session)

    if (!report) throw new this.NotFoundError(this.ERROR_MESSAGES.CAN_NOT_FIND('this report'))

    return await this.ReportResources.ref(report)
  };
  /**
   * @getList
   */
  getList = async (querySchema, match = {
    matchId_admin: {},
    matchId_vehicule: {}
  }, session = null) => {
    const {
      matchId_admin,
      matchId_vehicule,
    } = match
    const data = []
    const reportFindData = await this.SessionManager.executeQueryHookWithSession(this.Report.find(querySchema).populate({
      path: "id_admin",
      match: matchId_admin
    }).populate({
      path: "id_vehicule",
      match: matchId_vehicule
    }), session)

    for (const item of reportFindData) {
      if (item
        //&&item.id_admin
        //&&item.id_vehicule
      ) {
        data.push(await this.ReportResources.collection(item))
      }
    }

    return data
  };
  /**
   * @findOne
   */
  findOne = async (querySchema, session = null) => {
    let data = null

    const reportFindOneData = await this.SessionManager.executeQueryHookWithSession(this.Report.findOne(querySchema).populate({
      path: "id_admin",
    }).populate({
      path: "id_vehicule",
    }), session)

    if (reportFindOneData) {
      data = await this.ReportResources.collection(reportFindOneData)
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
          from: "admins",
          localField: "id_admin",
          foreignField: "_id",
          as: "id_admin"
        }
      },

      {
        $addFields: {
          id_admin: {
            $ifNull: [{
              $arrayElemAt: ['$id_admin', 0]
            }, null]
          }
        }
      },
      {
        $unwind: {
          path: '$id_admin',
          preserveNullAndEmptyArrays: true
        }
      },

      {
        $lookup: {
          from: "vehicles",
          localField: "id_vehicule",
          foreignField: "_id",
          as: "id_vehicule"
        }
      },

      {
        $addFields: {
          id_vehicule: {
            $ifNull: [{
              $arrayElemAt: ['$id_vehicule', 0]
            }, null]
          }
        }
      },
      {
        $unwind: {
          path: '$id_vehicule',
          preserveNullAndEmptyArrays: true
        }
      },

    ];
    const paginationResponse = await this.getPaginateAggregateDataService({
      Model: this.Report,
      perPage: perPage,
      page: page,
      query: query,
      route: route,
      pipeline: servicePipeline.concat(inputPipeline),
      countDocumentSchema: countDocumentSchema

    })

    const response = paginationResponse.data

    const data = await Promise.all(
      response.map(item => this.ReportResources.collection(item))
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