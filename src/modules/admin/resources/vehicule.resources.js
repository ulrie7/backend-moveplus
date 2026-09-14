/**
 * @VehicleResources 
 */
module.exports = class VehicleResources {

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
      immatriculation: model.immatriculation,
      type_vehicule: model.type_vehicule,
      brand: model.brand,
      modele: model.modele,
      color: model.color,
      year: model.year,
      status: model.status,
      gps_id: model.gps_id,
      coordinates: model.coordinates,
      image: model.image ? process.env.BASE_URL + "/" + model.image : null,
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
      immatriculation: model.immatriculation,
      type_vehicule: model.type_vehicule,
      brand: model.brand,
      modele: model.modele,
      color: model.color,
      year: model.year,
      status: model.status,
      coordinates: model.coordinates,
        image: model.image ? process.env.BASE_URL + "/" + model.image : null,
    }

    return schema
  }

}