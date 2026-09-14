/**
 * @AdminResources
 */
module.exports = class AdminResources {

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
      firstName: model.firstName,
      lastName: model.lastName,
      email: model.email,
      identity: model.identity,
      roles: model.roles,
      isActive: model.isActive,
      isBlocked: model.isBlocked,
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
      firstName: model.firstName,
      lastName: model.lastName,
      email: model.email,
      roles: model.roles,
      isActive: model.isActive,
      isBlocked: model.isBlocked,
    }

    return schema
  }

}