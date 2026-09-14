/**
 * @AlertResources 
 */
module.exports = class AlertResources {

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
      gps_id: model.gps_id,
      alert_type: model.alert_type,
      seuil: model.seuil,
      date_generation: model.date_generation,
      status: model.status,
      message: model.message,
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
      alert_type: model.alert_type,
      seuil: model.seuil,
      date_generation: model.date_generation,
      status: model.status,
      message: model.message,
    }

    return schema
  }

}