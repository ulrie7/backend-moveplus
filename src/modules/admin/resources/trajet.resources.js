/**
 * @TrajetResources 
 */
module.exports = class TrajetResources {

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
      date_start: model.date_start,
      date_end: model.date_end,
      stop_time: model.stop_time,
      stop_nb: model.stop_nb,
      status: model.status,
      vehicle_id: model.vehicle_id,
      distance: model.distance,
      average_speed: model.average_speed,
      max_speed: model.max_speed,
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
      date_start: model.date_start,
      date_end: model.date_end,
      stop_time: model.stop_time,
      stop_nb: model.stop_nb,
      status: model.status,
      distance: model.distance,
      average_speed: model.average_speed,
      max_speed: model.max_speed,
    }

    return schema
  }

}