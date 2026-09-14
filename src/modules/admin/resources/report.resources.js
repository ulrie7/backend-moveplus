/**
 * @ReportResources 
 */
module.exports = class ReportResources {

  constructor() {

  }
  /**
   * @collection
   */
  static async collection(model, filter = {}) {
    if (!model) return null
    const {} = filter

    const schema = {
      _id: model._id,
      createdBy: model.createdBy,
      updatedBy: model.updatedBy,
      deletedBy: model.deletedBy,
      id_admin: model.id_admin,
      id_vehicule: model.id_vehicule,
      report_type: model.report_type,
      date_generation: model.date_generation,
      periode_debut: model.periode_debut,
      periode_fin: model.periode_fin,
      statut: model.statut,
    }

    return schema
  }
  /**
   * @ref 
   */
  static async ref(model, filter = {}) {
    if (!model) return null

    const schema = {
      _id: model._id,
      report_type: model.report_type,
      date_generation: model.date_generation,
      periode_debut: model.periode_debut,
      periode_fin: model.periode_fin,
      statut: model.statut,
    }

    return schema
  }

}