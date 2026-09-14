/**
 * @GPSResources 
 */
module.exports = class GPSResources {

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
      imei: model.imei,
      status: model.status,
      battery: model.battery,
      brand: model.brand,
      last_connexion: model.last_connexion,
      model_device: model.model_device,
      vehicle_id: model.vehicle_id,
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
      imei: model.imei,
      status: model.status,
      battery: model.battery,
      brand: model.brand,
      last_connexion: model.last_connexion,
      model_device: model.model_device,
    }

    return schema
  }

}