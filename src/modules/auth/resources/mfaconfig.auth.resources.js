/**
 * @AuthMFAConfigResources 
 */
module.exports = class AuthMFAConfigResources {

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
      deletedAt: model.deletedAt,
      method: model.method,
      actorType: model.actorType,
      actorId: model.actorId,
      isEnabled: model.isEnabled,
      phoneNumber: model.phoneNumber,
      emailAddress: model.emailAddress,
    }

    return schema;
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
      deletedAt: model.deletedAt,
      method: model.method,
      actorType: model.actorType,
      actorId: model.actorId,
      isEnabled: model.isEnabled,
      phoneNumber: model.phoneNumber,
      emailAddress: model.emailAddress,
    }

    return schema
  }
  /**
   * @ref collection
   */
  static ref(model, filter = {}) {
    if (!model) return null

    const schema = {
      _id: model._id,
      createdAt: model.createdAt,
      updatedAt: model.updatedAt,
      deletedAt: model.deletedAt,
      method: model.method,
      actorType: model.actorType,
      actorId: model.actorId,
      isEnabled: model.isEnabled,
      phoneNumber: model.phoneNumber,
      emailAddress: model.emailAddress,
    }

    return schema;
  }

}