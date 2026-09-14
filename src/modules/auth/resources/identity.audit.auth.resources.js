/**
 * @AuthIdentityAuditResources 
 */
module.exports = class AuthIdentityAuditResources {

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
      action: model.action,
      identity: model.identity,
      details: model.details,
      performBy: model.performBy,
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
      action: model.action,
      details: model.details,
    }
    return schema
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
      action: model.action,
      details: model.details,
    }

    return schema;
  }

}