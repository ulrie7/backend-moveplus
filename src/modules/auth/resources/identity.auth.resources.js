/**
 * @AuthIdentityResources 
 */
module.exports = class AuthIdentityResources {

  constructor() {

  }
  /**
   * @Default collection
   */
  static async collection(model, filter = {}) {
    if (!model) return null

    const {} = filter

    const schema = {
      _id: model._id,
      createdAt: model.createdAt,
      updatedAt: model.updatedAt,
      firstName: model.firstName,
      lastName: model.lastName,
      identifier: model.identifier,
      identifierType: model.identifierType,
      isActive: model.isActive,
      isBlocked: model.isBlocked,
    }


    return schema
  }
  /**
   * @statistical collection
   */
  static async statistical(model, filter = {}) {
    if (!model) return null

    const {} = filter

    const schema = {
      createdAt: model.createdAt,
      updatedAt: model.updatedAt,
      firstName: model.firstName,
      lastName: model.lastName,
      identifier: model.identifier,
      identifierType: model.identifierType,
      isActive: model.isActive,
      isBlocked: model.isBlocked,
    }

    return schema;
  }
  /**
   * @ref collection
   */
  static async ref(model, filter = {}) {
    if (!model) return null

    const schema = {
      _id: model._id,
      createdAt: model.createdAt,
      updatedAt: model.updatedAt,
      firstName: model.firstName,
      lastName: model.lastName,
      identifier: model.identifier,
      identifierType: model.identifierType,
      isActive: model.isActive,
      isBlocked: model.isBlocked,
    }

    return schema;
  }

}