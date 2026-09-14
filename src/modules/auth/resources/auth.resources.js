/**
 * @AuthResources 
 */
module.exports = class AuthResources {

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
      actorType: model.actorType,
      accessToken: model.accessToken,
      accessTokenExpiresAt: model.accessTokenExpiresAt,
      refreshToken: model.refreshToken,
      refreshTokenExpiresAt: model.refreshTokenExpiresAt,
      mfa: model.mfa,
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
      actorType: model.actorType,
      accessToken: model.accessToken,
      accessTokenExpiresAt: model.accessTokenExpiresAt,
      refreshToken: model.refreshToken,
      refreshTokenExpiresAt: model.refreshTokenExpiresAt,
      mfa: model.mfa,
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
      actorType: model.actorType,
      accessToken: model.accessToken,
      accessTokenExpiresAt: model.accessTokenExpiresAt,
      refreshToken: model.refreshToken,
      refreshTokenExpiresAt: model.refreshTokenExpiresAt,
      mfa: model.mfa,
    }

    return schema;
  }

}