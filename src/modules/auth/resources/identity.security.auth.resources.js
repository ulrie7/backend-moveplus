/**
 * @AuthIdentitySecurityResources 
 */
module.exports = class AuthIdentitySecurityResources {

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
      identity: model.identity,
      identifierVerification: model.identifierVerification,
      passwordReset: model.passwordReset,
      oauth: model.oauth,
      lastLogin: model.lastLogin,
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
      identifierVerification: model.identifierVerification,
      passwordReset: model.passwordReset,
      oauth: model.oauth,
      lastLogin: model.lastLogin,
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
      identifierVerification: model.identifierVerification,
      passwordReset: model.passwordReset,
      oauth: model.oauth,
      lastLogin: model.lastLogin,
    }
    return schema;
  }

}