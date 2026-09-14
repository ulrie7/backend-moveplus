/**
 * @GeofenceResources 
 */
module.exports = class GeofenceResources {

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
      zone_name: model.zone_name,
      type_zone: model.type_zone,
      coordinates: model.coordinates,
      perimeter: model.perimeter,
      statut: model.statut,
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
      zone_name: model.zone_name,
      type_zone: model.type_zone,
      coordinates: model.coordinates,
      perimeter: model.perimeter,
      statut: model.statut,
    }

    return schema
  }

}