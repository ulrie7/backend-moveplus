/**
 * @AuthIdentityServices 
 */

const CoreServices = require("../../../shared/services/core.services")
const GoogleAuthProvider = require('../../../shared/lib/oauth_provider/GoogleAuthProvider');
module.exports = class AuthIdentityServices extends CoreServices {

  constructor() {
    super();
    this.AuthEnum = require("../enums/auth.enum");
    this.AuthConfig = require("../config/auth.config");

    this.AuthResource = require("../resources/auth.resources");
    this.MFAConfig = require("../models/mfaconfig.auth.model");
    this.MFAConfigEnum = require("../enums/mfaconfig.auth.enum");
    this.AuthIdentity = require("../models/identity.auth.model");
    this.AuthIdentityEnum = require("../enums/identity.auth.enum");
    this.AuthIdentitySecurityEnum = require("../enums/identity.security.auth.enum");
    this.AuthIdentitySecurity = require("../models/identity.security.auth.model");

    this.googleAuth = new GoogleAuthProvider();
  }
  /**
   * @findIdentityByIdentifier
   */
  async findIdentityByIdentifier(identifier, actorType, session = null) {
    return await this.SessionManager.executeQueryHookWithSession(this.AuthIdentity.findOne({
      identifier: identifier,
      actorType: actorType
    }), session)
  }
  /**
   * @findIdentityById
   */
  async findIdentityById(id) {
    return await this.AuthIdentity.findOne({
      _id: id
    })
  }
  /**
   * @create
   */
  async create(payload, session) {
    const identityExist = await this.findIdentityByIdentifier(payload.identifier, payload.actorType)
    if (identityExist) return identityExist

    const schema = {
      firstName: payload.firstName,
      lastName: payload.lastName,
      identifier: payload.identifier,
      identifierType: payload.identifierType,
      isActive: payload.isActive || false,
      actorType: payload.actorType
    }


    if (![this.AuthIdentityEnum.IDENTIFIER_TYPES.EMAIL.KEY, this.AuthIdentityEnum.IDENTIFIER_TYPES.PHONE.KEY].includes(schema.identifierType)) {
      schema.isActive = true
    }

    const identity = new this.AuthIdentity(schema)
    await identity.save({
      session
    })

    if ([this.AuthIdentityEnum.IDENTIFIER_TYPES.EMAIL.KEY, this.AuthIdentityEnum.IDENTIFIER_TYPES.PHONE.KEY].includes(schema.identifierType)) {
      await this.initIdentifierVerificationProcess({
        identity: identity._id,
        firstName: schema.firstName,
        lastName: schema.lastName,
        identifier: schema.identifier,
        identifierType: schema.identifierType,
        password: payload.password,
        shouldSkipVerificationCode: payload.shouldSkipVerificationCode || schema.isActive,
        channel: payload.channel,


      }, session)
    }

    return identity
  }
  /**
   * @returnSecurityPasswordHash
   */
  async returnSecurityPasswordHash(password) {
    return await this.HelperMethods.generateBcryptHash(password)
  }
  /**
   * @initIdentifierVerificationProcess
   */
  async initIdentifierVerificationProcess(payload, session) {
    // Validate identifier type early
    if (![
        this.AuthIdentityEnum.IDENTIFIER_TYPES.EMAIL.KEY,
        this.AuthIdentityEnum.IDENTIFIER_TYPES.PHONE.KEY,
      ].includes(payload.identifierType)) {
      throw new this.ApiError("Invalid identifier type on initIdentifierVerificationProcess")
    }

    const securityConfig = this.AuthConfig.getSecurityConfig()


    const schema = {
      identity: payload.identity,
    }

    // Check if security exists
    const securityExist = await this.AuthIdentitySecurity.findOne({
      identity: schema.identity
    })

    // Set password if creating new security and password provided
    if (!securityExist && payload.password) {
      schema.password = await this.returnSecurityPasswordHash(payload.password)
    }

    // Handle verification code

    if (!payload.shouldSkipVerificationCode) {
      const code = this.HelperMethods.generateId(securityConfig.identifierVerification.codeLength, false)
      const expiredOn = Date.now() + securityConfig.identifierVerification.codeExpiry

      schema.identifierVerification = {
        code: await this.HelperMethods.generateBcryptHash(code),
        expiredOn,
        contactId: null
      }

      // Send verification message
      const verificationResponse = await this.sendVerificationMessage(payload, code)
      schema.identifierVerification.contactId = verificationResponse.contactId
    }

    // Save or update security record
    let securityRecord
    if (securityExist) {
      await securityExist.updateOne(schema, {
        session
      })
      securityRecord = await this.AuthIdentitySecurity.findOne({
        _id: securityExist._id
      })
    } else {
      const security = new this.AuthIdentitySecurity(schema)
      securityRecord = await security.save({
        session
      })
    }

    return securityRecord
  }
  /**
   * Send verification message based on identifier type
   * @private
   */
  async sendVerificationMessage(payload, code) {
    let channel = payload.channel || this.AuthConfig.resolveDefaultChannelFromIdentifier(payload.identifierType)

    const messageData = {
      code,
      fullName: `${payload.lastName} ${payload.firstName}`,
      expiryMinutes: '20 minutes'
    }

    let template

    if (payload.identifierType === this.AuthIdentityEnum.IDENTIFIER_TYPES.EMAIL.KEY) {
      channel = this.MessageDispatcher.CHANNELS.EMAIL
      messageData.email = payload.identifier
      template = this.EMAIL_TEMPLATES.VERIFY_EMAIL
    } else if (payload.identifierType === this.AuthIdentityEnum.IDENTIFIER_TYPES.PHONE.KEY) {
      messageData.phoneNumber = payload.identifier
      template = this.SMS_TEMPLATES.VERIFY_PHONE
    }

    return await this.MessageDispatcher.sendMessage(messageData, channel, template)
  }
  /**
   * @initIdentifierResetPasswordProcess
   */
  async initIdentifierResetPasswordProcess(payload, session) {
    // Validate identifier type early
    if (![
        this.AuthIdentityEnum.IDENTIFIER_TYPES.EMAIL.KEY,
        this.AuthIdentityEnum.IDENTIFIER_TYPES.PHONE.KEY,
      ].includes(payload.identifierType)) {
      throw new this.ApiError("Invalid identifier type on initIdentifierResetPasswordProcess")
    }

    const securityConfig = this.AuthConfig.getSecurityConfig()

    const schema = {
      identity: payload.identity,
    }

    // Check if security exists
    const securityExist = await this.AuthIdentitySecurity.findOne({
      identity: schema.identity
    })

    // Set password if creating new security (unusual case for password reset)
    if (!securityExist && payload.password) {
      schema.password = await this.returnSecurityPasswordHash(payload.password)
    }

    // Generate password reset code
    const code = this.HelperMethods.generateId(securityConfig.passwordReset.codeLength, false)
    const expiredOn = Date.now() + securityConfig.passwordReset.codeExpiry

    schema.passwordReset = {
      code: await this.HelperMethods.generateBcryptHash(code),
      expiredOn,
      contactId: null
    }

    // Send password reset message
    const resetResponse = await this.sendPasswordResetMessage(payload, code)
    schema.passwordReset.contactId = resetResponse.contactId

    // Save or update security record
    let securityRecord
    if (securityExist) {
      await securityExist.updateOne(schema, {
        session
      })
      securityRecord = await this.AuthIdentitySecurity.findOne({
        _id: securityExist._id
      })
    } else {
      const security = new this.AuthIdentitySecurity(schema)
      securityRecord = await security.save({
        session
      })
    }

    return securityRecord
  }
  /**
   * Send password reset message based on identifier type
   * @private
   */
  async sendPasswordResetMessage(payload, code) {
    let channel = payload.channel || this.AuthConfig.resolveDefaultChannelFromIdentifier(payload.identifierType)

    const messageData = {
      code,
      fullName: `${payload.lastName} ${payload.firstName}`,
      expiryMinutes: '20 minutes'
    }

    let template

    if (payload.identifierType === this.AuthIdentityEnum.IDENTIFIER_TYPES.EMAIL.KEY) {
      channel = this.MessageDispatcher.CHANNELS.EMAIL
      messageData.email = payload.identifier
      template = this.EMAIL_TEMPLATES.PASSWORD_RESTORATION_CODE
    } else if (payload.identifierType === this.AuthIdentityEnum.IDENTIFIER_TYPES.PHONE.KEY) {
      messageData.phoneNumber = payload.identifier
      template = this.SMS_TEMPLATES.PASSWORD_RESTORATION_CODE
    }

    return await this.MessageDispatcher.sendMessage(messageData, channel, template)
  }
  /**
   * @fetchOauthOrCreate
   */
  async fetchOauthOrCreate(payload, session) {
    // find oauth id
    const authIdentitySecurityExist = await this.SessionManager.executeQueryHookWithSession(this.AuthIdentitySecurity.findOne({
      "oauth.id": payload.oauth.id,

    }).populate({
      path: "identity"
    }), session)


    if (authIdentitySecurityExist) {
      return authIdentitySecurityExist.identity
    }

    const identity = await this.create({
      identifierType: this.AuthIdentityEnum.IDENTIFIER_TYPES.OAUTH.KEY,
      identifier: payload.identifier,
      firstName: payload.firstName,
      lastName: payload.lastName,
      actorType: payload.actorType,

    }, session)

    const schema = {
      identity: identity._id,
      oauth: {
        provider: payload.oauth.provider,
        id: payload.oauth.id,
      }
    }

    const authIdentitySecurityExistForIdentity = await this.SessionManager.executeQueryHookWithSession(this.AuthIdentitySecurity.findOne({
      identity: identity._id,
    }), session)

    if (!authIdentitySecurityExistForIdentity) {
      await this.SessionManager.executeCallbackInTransaction(this.AuthIdentitySecurity.create(schema), session)
    }

    return identity
  }
  /**
   * @findOrCreateGoogleUser
   */
  async findOrCreateGoogleUser(credentials, actorType, session = null) {
    try {
      const profile = await this.googleAuth.getProfile(credentials);

      const identity = await this.fetchOauthOrCreate({
        oauth: {
          provider: this.AuthIdentitySecurityEnum.OAUTH_PROVIDERS.GOOGLE.PROVIDER,
          id: profile.id,
        },
        identifier: profile.email,
        firstName: profile.given_name,
        lastName: profile.family_name,
        actorType: actorType,
      }, session);

      return {
        identity
      };
    } catch (error) {
      console.error("Google auth error:", error);
      throw error;
    }
  }
  /**
   * @findOrCreateOTPUser
   */
  async findOrCreateOTPUser(identifier, identifierType, actorType, session) {
    let identity = await this.findIdentityByIdentifier(identifier, actorType, session)

    if (!identity) {
      // create identity

      identity = await this.create({
        identifierType: identifierType,
        identifier: identifier,
        firstName: "",
        lastName: "",
        actorType: actorType,
        shouldSkipVerificationCode: true

      }, session)

      const schema = {
        identity: identity._id,

      }

      const authIdentitySecurityExistForIdentity = await this.SessionManager.executeQueryHookWithSession(this.AuthIdentitySecurity.findOne({
        identity: identity._id,
      }), session)

      if (!authIdentitySecurityExistForIdentity) {
        await this.SessionManager.executeCallbackInTransaction(this.AuthIdentitySecurity.create(schema), session)
      }

    }
    return {
      identity: identity
    }
  }
  /**
   * @matchPassword
   */
  async matchPassword(security, password) {
    return await this.bcrypt.compare(
      password,
      security.password
    );
  }
  /**
   * @matchSecurityIdentifierVerificationCode
   */
  async matchSecurityIdentifierVerificationCode(security, code) {
    return await this.bcrypt.compare(
      code,
      security.identifierVerification.code
    );
  }
  /**
   * @matchSecurityPasswordResetCode
   */
  async matchSecurityPasswordResetCode(security, code) {
    return await this.bcrypt.compare(
      code,
      security.passwordReset.code
    );
  }
  /**
   * @identityVerificationCodeIsExpired
   */
  identityVerificationCodeIsExpired(security) {
    return Date.now() > security.identifierVerification.expiredOn.getTime()
  }
  /**
   * @identityPasswordResetCodeIsExpired
   */
  identityPasswordResetCodeIsExpired(security) {
    return Date.now() > security.passwordReset.expiredOn.getTime()
  }
  /**
   * @verifyIdentifier
   */
  async verifyIdentifier(payload, session) {
    // find oauth id
    const authIdentitySecurityExist = await this.AuthIdentitySecurity.findOne({
      identity: payload.identity,

    }).populate({
      path: "identity"
    }).select("+identifierVerification.code")

    if (!authIdentitySecurityExist) throw new this.NotFoundError(this.ERROR_MESSAGES.CAN_NOT_FIND("this auth identity security"))

    const schema = {
      identifierVerification: {
        contactId: authIdentitySecurityExist.identifierVerification.contactId,
        code: authIdentitySecurityExist.identifierVerification.code,
        expiredOn: authIdentitySecurityExist.identifierVerification.expiredOn,
        lastAttemptAt: Date.now(),
        attempts: (authIdentitySecurityExist.identifierVerification.attempts || 0) + 1,
      }
    }
    if (await this.matchSecurityIdentifierVerificationCode(authIdentitySecurityExist, payload.code)) {
      if (this.identityVerificationCodeIsExpired(authIdentitySecurityExist)) throw new this.ApiError(this.ERROR_MESSAGES.EXPIRED("identity verification code"))
      schema.identifierVerification.code = ''
      schema.identifierVerification.expiredOn = ''
      schema.identifierVerification.expiredOn = Date.now()

      await authIdentitySecurityExist.updateOne(schema, {
        session
      })
      await this.AuthIdentity.updateOne({
        _id: authIdentitySecurityExist.identity._id
      }, {
        $set: {
          isActive: true
        }
      }, {
        session
      });
      return {
        verify: true
      }
    } else {
      await authIdentitySecurityExist.updateOne(schema)

      if (schema.identifierVerification.attempts > 2) {

        schema.identifierVerification.expiredOn = Date.now()
        await tokenAuth.updateOne(schema)
        throw new this.ApiError(this.ERROR_MESSAGES.EXPIRED("identity verification code"))
      } else {
        throw new this.ApiError('invalid identity verification code')
      }
    }
  }
  /**
   * @resendIdentifierVerificationCode
   */
  async resendIdentifierVerificationCode(payload, session) {
    // find oauth id
    const authIdentitySecurityExist = await this.AuthIdentitySecurity.findOne({
      identity: payload.identity,
    }).populate({
      path: "identity"
    })

    if (!authIdentitySecurityExist) throw new this.NotFoundError(this.ERROR_MESSAGES.CAN_NOT_FIND("this auth identity security"))

    await this.initIdentifierVerificationProcess({
      identity: authIdentitySecurityExist.identity._id,
      firstName: authIdentitySecurityExist.identity.firstName,
      lastName: authIdentitySecurityExist.identity.lastName,
      identifier: authIdentitySecurityExist.identity.identifier,
      identifierType: authIdentitySecurityExist.identity.identifierType,
      channel: payload.channel,
    }, session)


    return {
      verificationCodeSent: true
    }
  }
  /**
   * @getSigninLocals
   */
  getSigninLocals(identity) {
    const locals = {
      fullName: `${identity.lastName} ${identity.firstName} `,
      expiryMinutes: "15 minutes"
    }
    if (identity.identifierType == this.AuthIdentityEnum.IDENTIFIER_TYPES.EMAIL.KEY) {
      locals.email = identity.identifier
    }
    if (identity.identifierType == this.AuthIdentityEnum.IDENTIFIER_TYPES.PHONE.KEY) {
      locals.phoneNumber = identity.identifier
    }
    return locals
  }
  /**
   * @signin
   */
  async signin(payload) {
    // find oauth id
    const authIdentitySecurityExist = await this.AuthIdentitySecurity.findOne({
      identity: payload.identity,
      actorType: payload.actorType,
    }).populate({
      path: "identity"
    }).select("+password")

    if (!authIdentitySecurityExist) throw new this.NotFoundError(this.ERROR_MESSAGES.CAN_NOT_FIND("this auth identity security"))

    const matchPassword = await this.matchPassword(authIdentitySecurityExist, payload.password)

    if (matchPassword) {

      const locals = this.getSigninLocals(authIdentitySecurityExist.identity)
      return {
        id: authIdentitySecurityExist.identity._id,
        actorType: payload.actorType,
        locals
      }

    } else {
      throw new this.ApiError(this.ERROR_MESSAGES.ACCESS_DENIED)
    }
  }
  /**
   * @sendPasswordResetCode
   */
  async sendPasswordResetCode(payload, session) {
    // find oauth id
    const authIdentitySecurityExist = await this.AuthIdentitySecurity.findOne({
      identity: payload.identity,

    }).populate({
      path: "identity"
    })

    if (!authIdentitySecurityExist) throw new this.NotFoundError(this.ERROR_MESSAGES.CAN_NOT_FIND("this auth identity security"))

    await this.initIdentifierResetPasswordProcess({
      identity: authIdentitySecurityExist.identity._id,
      firstName: authIdentitySecurityExist.identity.firstName,
      lastName: authIdentitySecurityExist.identity.lastName,
      identifier: authIdentitySecurityExist.identity.identifier,
      identifierType: authIdentitySecurityExist.identity.identifierType,
      channel: payload.channel
    }, session)


    return {
      resetCodeSent: true
    }
  }
  /**
   * @verifyPasswordResetCode
   */
  async verifyPasswordResetCode(payload, session) {
    // find oauth id
    const authIdentitySecurityExist = await this.AuthIdentitySecurity.findOne({
      identity: payload.identity,

    }).populate({
      path: "identity"
    }).select("+passwordReset.code")

    if (!authIdentitySecurityExist) throw new this.NotFoundError(this.ERROR_MESSAGES.CAN_NOT_FIND("this auth identity security"))

    const schema = {
      passwordReset: {
        contactId: authIdentitySecurityExist.passwordReset.contactId,
        code: authIdentitySecurityExist.passwordReset.code,
        expiredOn: authIdentitySecurityExist.passwordReset.expiredOn,
        lastAttemptAt: Date.now(),
        attempts: (authIdentitySecurityExist.passwordReset.attempts || 0) + 1,
      }
    }
    if (await this.matchSecurityPasswordResetCode(authIdentitySecurityExist, payload.code)) {
      if (this.identityPasswordResetCodeIsExpired(authIdentitySecurityExist)) throw new this.ApiError(this.ERROR_MESSAGES.EXPIRED("identity verification code"))
      schema.passwordReset.code = ''
      schema.passwordReset.expiredOn = ''
      schema.passwordReset.expiredOn = Date.now()

      await authIdentitySecurityExist.updateOne(schema, {
        session
      })
      await this.AuthIdentity.updateOne({
        _id: authIdentitySecurityExist.identity._id
      }, {
        $set: {
          isActive: true
        }
      }, {
        session
      });

      // generate token
      const temporaryToken = this.jwt.sign({
          _id: authIdentitySecurityExist.identity._id,
          purpose: 'password-reset'
        },
        process.env.SECRET_KEY + "password-reset", {
          expiresIn: '15m',
          algorithm: 'HS256'
        }
      );

      return {
        verify: true,
        temporaryToken: temporaryToken
      }
    } else {
      await authIdentitySecurityExist.updateOne(schema)

      if (schema.passwordReset.attempts > 2) {

        schema.passwordReset.expiredOn = Date.now()
        await tokenAuth.updateOne(schema)
        throw new this.ApiError(this.ERROR_MESSAGES.EXPIRED("identity verification code"))
      } else {
        throw new this.ApiError('invalid identity verification code')
      }
    }
  }
  /**
   * @resetPassword
   */
  async resetPassword(token, password) {
    // verify token
    const decoded = this.jwtVerify(token, process.env.SECRET_KEY + "password-reset");

    if (decoded.purpose != 'password-reset') throw new this.ApiError(this.ERROR_MESSAGES.INVALID_TOKEN)
    // find oauth id
    const authIdentitySecurityExist = await this.AuthIdentitySecurity.findOne({
      identity: decoded._id,

    }).populate({
      path: "identity"
    })
    if (!authIdentitySecurityExist) throw new this.NotFoundError(this.ERROR_MESSAGES.CAN_NOT_FIND("this auth identity security"))

    const schema = {
      password: await this.returnSecurityPasswordHash(password)
    }

    await authIdentitySecurityExist.updateOne(schema)

    return {
      reset: true,
    }
  }
  /**
   * @changePassword
   */
  async changePassword(payload) {
    const authIdentitySecurityExist = await this.AuthIdentitySecurity.findOne({
      identity: payload.id,

    }).populate({
      path: "identity"
    }).select("+password")
    if (!authIdentitySecurityExist) throw new this.NotFoundError(this.ERROR_MESSAGES.CAN_NOT_FIND("this auth identity security"))

    if (await this.matchPassword(authIdentitySecurityExist, payload.oldPassword)) {
      const schema = {
        password: await this.returnSecurityPasswordHash(payload.newPassword)
      }

      await authIdentitySecurityExist.updateOne(schema)

      return {
        success: true,
      }
    } else throw new this.ApiError(this.ERROR_MESSAGES.PASSWORD_NOT_MATCH)
  }

}