/**
 * @AuthServices - Professional authentication service
 * Handles: Signin, Signout, Token Management, Password Operations
 */

const CoreServices = require("../../../shared/services/core.services");
module.exports = class AuthServices extends CoreServices {

  constructor() {
    super();
    this.AuthIdentityEnum = require("../enums/identity.auth.enum");

    this.AuthIdentity = require("../models/identity.auth.model");
    this.AuthIdentitySecurity = require("../models/identity.security.auth.model");
    this.AuthSession = require("../models/session.auth.model");

    this.IdentityService = new(require("./identity.auth.services"))();
    this.MFAService = new(require("./mfa.auth.services"))();
    this.SessionService = new(require("./session.auth.services"))();
    this.SecurityService = new(require("./security.auth.services"))();

    this.AuthConfig = require("../config/auth.config");
    this.AuthEnum = require("../enums/auth.enum");

    this.tokenBlacklist = new Set();
  } // ============================================================
  // SIGNIN METHODS
  // ============================================================
  async signin(payload, requestInfo = {}) {
    const {
      identity: identityId,
      password,
      code,
      actorType,
      oauthProvider,
      channel,
      otpCode
    } = payload;

    const identity = await this.IdentityService.findIdentityById(identityId);
    if (!identity) {
      throw new this.NotFoundError('Account not found');
    }

    const authType = this._determineAuthType({
      identity: identity._id,
      identifierType: identity.identifierType,
      password,
      oauthProvider,
      code,
      otpCode
    });

    switch (authType) {
      case this.AuthEnum.AUTH_TYPES.EMAIL_PASSWORD:
      case this.AuthEnum.AUTH_TYPES.PHONE_PASSWORD:
        this._validateAccountStatus(identity);
        return await this.signinWithPassword(identity, password, actorType, requestInfo);

      case this.AuthEnum.AUTH_TYPES.OTP_ONLY:
        return await this.signinWithOTP(identity, otpCode, channel, actorType, requestInfo);

      case this.AuthEnum.AUTH_TYPES.GOOGLE:
        return await this.signinWithGoogle(code, actorType, requestInfo);

      default:
        throw new this.ApiError('Invalid authentication method');
    }
  }
  /**
   * @signinWithPassword
   */

  async signinWithPassword(identity, password, actorType, requestInfo = {}) {
    const {
      ipAddress,
      userAgent,
      deviceInfo = {}
    } = requestInfo;

    const rateLimitCheck = await this.SecurityService.checkRateLimit(
      identity.identifier,
      'login',
      ipAddress
    );

    if (!rateLimitCheck.allowed) {
      await this._logFailedSignin(
        'Rate limit exceeded',
        identity,
        requestInfo, {
          riskLevel: this.AuthEnum.SECURITY_LEVELS.HIGH
        }
      );
      throw new this.ApiError(
        `Too many attempts. Try again in ${Math.ceil(rateLimitCheck.lockoutTime / 60000)} minutes`
      );
    }

    const securityRecord = await this.AuthIdentitySecurity.findOne({
      identity: identity._id
    }).select('+password');

    if (!securityRecord || !securityRecord.password) {
      throw new this.ApiError('Invalid credentials');
    }

    const isPasswordValid = await this.bcrypt.compare(password, securityRecord.password);
    if (!isPasswordValid) {
      await this._logFailedSignin(
        'Invalid password',
        identity,
        requestInfo, {
          riskLevel: this.AuthEnum.SECURITY_LEVELS.MEDIUM
        }
      );
      throw new this.ApiError('Invalid credentials');
    }

    const riskAnalysis = await this.SecurityService.analyzeLoginAttempt({
      identifier: identity.identifier,
      ipAddress,
      userAgent,
      actorType,
      device: deviceInfo,
      location: requestInfo.location
    });

    return await this._completeSignin(identity, actorType, requestInfo, riskAnalysis);
  }
  /**
   * @signinWithOTP
   */

  async signinWithOTP(identity, otpCode, channel, actorType, requestInfo = {}) {
    const otpVerification = await this.MFAService.verifyOTPCode(
      actorType,
      identity.identifier,
      otpCode,
      channel
    );

    if (!otpVerification.verified) {
      await this._logFailedSignin(
        'Invalid OTP code',
        identity,
        requestInfo, {
          riskLevel: this.AuthEnum.SECURITY_LEVELS.MEDIUM
        }
      );
      throw new this.ApiError('Invalid or expired OTP code');
    }

    const riskAnalysis = {
      riskLevel: this.AuthEnum.SECURITY_LEVELS.LOW,
      riskFactors: [],
      totalRiskScore: 0,
      requiresMfa: false
    };

    if (!identity.isActive) {
      await this.AuthIdentity.updateOne({
        _id: identity._id
      }, {
        $set: {
          isActive: true
        }
      });
    }

    return await this._completeSignin(identity, actorType, requestInfo, riskAnalysis);
  }
  /**
   * @signinWithGoogle
   */

  async signinWithGoogle(credentials, actorType, requestInfo = {}) {
    const {
      identity
    } = await this.IdentityService.findOrCreateGoogleUser(credentials, actorType);

    const riskAnalysis = {
      riskLevel: this.AuthEnum.SECURITY_LEVELS.LOW,
      riskFactors: [],
      totalRiskScore: 0,
      requiresMfa: false
    };

    return await this._completeSignin(identity, actorType, requestInfo, riskAnalysis);
  }
  /**
   * @_completeSignin
   */

  async _completeSignin(identity, actorType, requestInfo, riskAnalysis) {
    const {
      ipAddress,
      userAgent,
      deviceInfo = {}
    } = requestInfo;

    const actorConfig = this.AuthConfig.getActorConfig(actorType);
    if (!actorConfig) {
      throw new this.ApiError('Invalid actor type');
    }

    const isTrustedDevice = await this.MFAService.isTrustedDevice(
      actorType,
      identity._id,
      deviceInfo.fingerprint
    );

    const requiresMFA = actorConfig.requiresMFA &&
      !isTrustedDevice &&
      !riskAnalysis.shouldBlock;

    const accessTokenData = this._generateAccessToken(identity._id, actorConfig);
    const refreshTokenData = this._generateRefreshToken(identity._id, actorConfig);

    const sessionPayload = {
      userId: identity._id,
      actorType,
      accessToken: accessTokenData.accessToken,
      refreshToken: refreshTokenData.refreshToken,
      accessTokenExpiresAt: accessTokenData.accessTokenExpiresAt,
      refreshTokenExpiresAt: refreshTokenData.refreshTokenExpiresAt,
      device: {
        type: deviceInfo.type || this.AuthEnum.DEVICE_TYPES.WEB,
        name: deviceInfo.name || 'Unknown Device',
        fingerprint: deviceInfo.fingerprint || null,
        userAgent: userAgent || null,
        isTrusted: isTrustedDevice
      },
      ipAddress,
      location: requestInfo.location || {},
      mfaVerified: !requiresMFA,
      securityLevel: riskAnalysis.riskLevel || this.AuthEnum.SECURITY_LEVELS.MEDIUM
    };

    let mfaData = {
      isEnabled: false
    };
    if (requiresMFA) {
      const locals = this.IdentityService.getSigninLocals(identity);
      mfaData = await this.MFAService.getSchema(actorType, identity._id, locals);

      sessionPayload.mfa = {
        isEnabled: mfaData.isEnabled,
        code: mfaData.code,
        contactId: mfaData.contactId,
        codeExpiresAt: mfaData.codeExpiresAt ? new Date(mfaData.codeExpiresAt) : null,
        method: mfaData.method,
      };
    }

    const session = await this.SessionService.createSession(sessionPayload);

    await this.SecurityService.logSecurityEvent({
      eventType: this.AuthEnum.AUTH_EVENTS.LOGIN_SUCCESS,
      userId: identity._id,
      actorType,
      sessionId: session.sessionId,
      ipAddress,
      userAgent,
      device: deviceInfo,
      location: requestInfo.location,
      success: true,
      riskLevel: riskAnalysis.riskLevel,
      riskFactors: riskAnalysis.riskFactors,
      totalRiskScore: riskAnalysis.totalRiskScore,
      metadata: {
        requiresMFA,
        isTrustedDevice,
        sessionId: session.sessionId
      }
    });

    return {
      success: true,
      accessToken: accessTokenData.accessToken,
      accessTokenExpiresAt: accessTokenData.accessTokenExpiresAt,
      refreshToken: refreshTokenData.refreshToken,
      refreshTokenExpiresAt: refreshTokenData.refreshTokenExpiresAt,
      sessionId: session.sessionId,
      mfa: {
        isEnabled: mfaData.isEnabled,
        isCodeSent: mfaData.isCodeSent,
        method: mfaData.method,
        expiresAt: mfaData.codeExpiresAt
      },
      riskAssessment: {
        level: riskAnalysis.riskLevel,
        score: riskAnalysis.totalRiskScore,
        requiresAdditionalVerification: riskAnalysis.requiresMfa
      },
      user: {
        id: identity._id,
        firstName: identity.firstName,
        lastName: identity.lastName,
        identifier: identity.identifier,
        identifierType: identity.identifierType,
        actorType
      }
    };
  }
  // ============================================================
  // SIGNOUT METHODS
  // ============================================================
  async signout(accessToken, signoutAll = false, requestInfo = {}) {
    const session = await this.SessionService.findSessionByToken(accessToken);

    if (session) {
      if (signoutAll) {
        await this.SessionService.revokeAllSessions(session.userId, null, 'user');
      } else {
        await this.SessionService.revokeSession(session.sessionId, 'user', 'Manual signout');
      }

      this._blacklistToken(accessToken);
    }

    return {
      success: true,
      message: 'Signed out successfully'
    };
  }
  // ============================================================
  // TOKEN METHODS
  // ============================================================
  _generateAccessToken(userId, actorConfig) {
    const expiry = actorConfig.accessTokenExpiry;
    const accessTokenExpiresAt = Date.now() + expiry;

    const payload = {
      _id: userId,
      type: this.AuthEnum.TOKEN_TYPES.ACCESS,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(accessTokenExpiresAt / 1000)
    };

    const securityConfig = this.AuthConfig.getSecurityConfig();
    const accessToken = this.jwt.sign(payload, process.env.SECRET_KEY, {
      algorithm: securityConfig.tokens.algorithm,
      issuer: securityConfig.tokens.issuer,
      audience: securityConfig.tokens.audience
    });

    return {
      accessToken,
      accessTokenExpiresAt
    };
  }
  /**
   * @_generateRefreshToken
   */

  _generateRefreshToken(userId, actorConfig) {
    const expiry = actorConfig.refreshTokenExpiry;
    const refreshTokenExpiresAt = Date.now() + expiry;

    const payload = {
      _id: userId,
      type: this.AuthEnum.TOKEN_TYPES.REFRESH,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(refreshTokenExpiresAt / 1000)
    };

    const securityConfig = this.AuthConfig.getSecurityConfig();
    const refreshToken = this.jwt.sign(payload, process.env.SECRET_KEY + "refresh", {
      algorithm: securityConfig.tokens.algorithm,
      issuer: securityConfig.tokens.issuer,
      audience: securityConfig.tokens.audience
    });

    return {
      refreshToken,
      refreshTokenExpiresAt
    };
  }
  /**
   * @refreshTokens
   */

  async refreshTokens(refreshToken, requestInfo = {}) {
    const {
      ipAddress,
      deviceInfo = {}
    } = requestInfo;

    // Rate limiting
    const rateLimitCheck = await this.SecurityService.checkRateLimit(
      refreshToken.substring(0, 20), // Use token prefix as key
      'tokenRefresh',
      ipAddress
    );

    if (!rateLimitCheck.allowed) {
      throw new this.ApiError(
        `Too many refresh attempts. Try again in ${Math.ceil(rateLimitCheck.lockoutTime / 60000)} minutes`
      );
    }

    const decoded = this.jwtVerify(refreshToken, process.env.SECRET_KEY + "refresh");
    if (!decoded || decoded.type !== this.AuthEnum.TOKEN_TYPES.REFRESH) {
      throw new this.ApiError('Invalid refresh token');
    }

    const session = await this.SessionService.findSessionByToken(refreshToken, 'refresh');
    if (!session) {
      throw new this.ApiError('Session not found or expired');
    }

    if (deviceInfo.fingerprint &&
      session.device &&
      session.device.fingerprint &&
      session.device.fingerprint !== deviceInfo.fingerprint) {

      await this.SessionService.markSessionSuspicious(
        session.sessionId,
        'Device fingerprint mismatch during token refresh'
      );

      if (this.AuthConfig.shouldNotify('suspiciousActivity')) {
        await this._sendSecurityAlert(session.userId, 'suspicious_refresh', {
          ipAddress,
          deviceInfo,
          sessionId: session.sessionId
        });
      }

      throw new this.ApiError('Session security violation');
    }

    const actorConfig = this.AuthConfig.getActorConfig(session.actorType);
    const accessTokenData = this._generateAccessToken(session.userId, actorConfig);

    let newRefreshTokenData = null;
    if (this.AuthConfig.getSecurityConfig().tokens.refreshTokenRotation) {
      newRefreshTokenData = this._generateRefreshToken(session.userId, actorConfig);
      this._blacklistToken(refreshToken);
    }

    session.accessToken = accessTokenData.accessToken;
    session.accessTokenExpiresAt = accessTokenData.accessTokenExpiresAt;

    if (newRefreshTokenData) {
      session.refreshToken = newRefreshTokenData.refreshToken;
      session.refreshTokenExpiresAt = newRefreshTokenData.refreshTokenExpiresAt;
    }

    session.lastActivityAt = new Date();
    if (ipAddress) session.ipAddress = ipAddress;

    await session.save();

    await this.SecurityService.logSecurityEvent({
      eventType: this.AuthEnum.AUTH_EVENTS.TOKEN_REFRESH,
      userId: session.userId,
      actorType: session.actorType,
      sessionId: session.sessionId,
      ipAddress: ipAddress || session.ipAddress,
      success: true,
      metadata: {
        refreshTokenRotated: !!newRefreshTokenData,
        sessionId: session.sessionId
      }
    });

    return {
      success: true,
      accessToken: accessTokenData.accessToken,
      accessTokenExpiresAt: accessTokenData.accessTokenExpiresAt,
      refreshToken: newRefreshTokenData ? newRefreshTokenData.refreshToken : refreshToken,
      refreshTokenExpiresAt: newRefreshTokenData ? newRefreshTokenData.refreshTokenExpiresAt : session.refreshTokenExpiresAt
    };
  }
  /**
   * @verifyAccessToken
   */

  async verifyAccessToken(accessToken, ignoreMFAVerification = false) {
    try {
      if (this._isTokenBlacklisted(accessToken)) {
        return {
          valid: false,
          error: 'Token has been revoked',
          requiresMFA: false,
          data: null
        };
      }

      const session = await this.AuthSession.findOne({
        accessToken: accessToken,
        status: this.AuthEnum.SESSION_STATUS.ACTIVE
      }).select('+mfa.code');

      if (!session) {
        return {
          valid: false,
          error: 'Session not found or expired',
          requiresMFA: false,
          data: null
        };
      }

      if (session.isExpired) {
        return {
          valid: false,
          error: 'Session expired',
          requiresMFA: false,
          data: null
        };
      }

      if (session.status !== this.AuthEnum.SESSION_STATUS.ACTIVE) {
        return {
          valid: false,
          error: 'Session is not active',
          requiresMFA: false,
          data: null
        };
      }

      if (!ignoreMFAVerification) {
        const actorConfig = this.AuthConfig.getActorConfig(session.actorType);

        if (actorConfig && actorConfig.requiresMFA && session.mfa && session.mfa.isEnabled) {
          if (!session.mfaVerified) {
            return {
              valid: false,
              error: 'MFA verification required',
              requiresMFA: true,
              mfaInfo: {
                method: session.mfa.method,
                isCodeSent: session.mfa.isCodeSent,
                expiresAt: session.mfa.codeExpiresAt,
                attemptsRemaining: 5 - (session.mfa.attempts || 0)
              },
              data: null
            };
          }
        }
      }

      await this.SessionService.updateSessionActivity(session.sessionId);

      return {
        valid: true,
        error: null,
        requiresMFA: false,
        data: session
      };

    } catch (error) {
      return {
        valid: false,
        error: error.message,
        requiresMFA: false,
        data: null
      };
    }
  }
  // ============================================================
  // AUTHENTICATION MIDDLEWARE
  // ============================================================
  async authenticate(token, accessLevels = null) {
    if (!token) {
      return {
        success: false,
        message: 'No token provided',
        error: this.AuthEnum.ERROR_CODES.UNDEFINED_TOKEN
      };
    }

    const {
      valid,
      error,
      requiresMFA,
      mfaInfo,
      data: session
    } = await this.verifyAccessToken(token);

    if (!valid) {
      return {
        success: false,
        message: error,
        error: requiresMFA ? this.AuthEnum.ERROR_CODES.MFA_REQUIRED : this.AuthEnum.ERROR_CODES.INVALID_TOKEN,
        requiresMFA,
        mfaInfo
      };
    }

    const identity = await this.IdentityService.findIdentityById(session.userId);
    if (!identity) {
      return {
        success: false,
        message: 'User not found',
        error: this.AuthEnum.ERROR_CODES.CAN_NOT_FIND
      };
    }

    if (!identity.isActive) {
      return {
        success: false,
        message: 'Account is not active',
        error: this.AuthEnum.ERROR_CODES.ACCOUNT_DISABLED
      };
    }

    if (identity.isBlocked) {
      return {
        success: false,
        message: 'Account is blocked',
        error: this.AuthEnum.ERROR_CODES.ACCOUNT_BLOCKED
      };
    }

    if (accessLevels && !this._validateAccessLevel(accessLevels, identity)) {
      return {
        success: false,
        message: 'Insufficient permissions',
        error: this.AuthEnum.ERROR_CODES.ACCESS_DENIED
      };
    }

    return {
      success: true,
      data: identity,
      session: {
        id: session.sessionId,
        deviceInfo: session.device,
        lastActivity: session.lastActivityAt,
        securityLevel: session.securityLevel
      }
    };
  }
  // ============================================================
  // PASSWORD MANAGEMENT
  // ============================================================
  async requestOTP(payload) {
    const {
      identifier,
      actorType,
      channel
    } = payload;

    const validChannels = [
      this.AuthEnum.MESSAGE_CHANNELS.EMAIL,
      this.AuthEnum.MESSAGE_CHANNELS.SMS,
      this.AuthEnum.MESSAGE_CHANNELS.WHATSAPP
    ];

    if (!validChannels.includes(channel)) {
      throw new this.ApiError('Invalid channel');
    }

    // Rate limiting
    const rateLimitCheck = await this.SecurityService.checkRateLimit(
      identifier,
      'otpRequest',
      null
    );

    if (!rateLimitCheck.allowed) {
      throw new this.ApiError(
        `Too many OTP requests. Try again in ${Math.ceil(rateLimitCheck.lockoutTime / 60000)} minutes`
      );
    }

    const identifierTypeMap = {
      [this.AuthEnum.MESSAGE_CHANNELS.EMAIL]: this.AuthEnum.IDENTIFIER_TYPES.EMAIL,
      [this.AuthEnum.MESSAGE_CHANNELS.SMS]: this.AuthEnum.IDENTIFIER_TYPES.PHONE,
      [this.AuthEnum.MESSAGE_CHANNELS.WHATSAPP]: this.AuthEnum.IDENTIFIER_TYPES.PHONE,
    };

    const identifierType = identifierTypeMap[channel];

    const {
      identity
    } = await this.IdentityService.findOrCreateOTPUser(identifier, identifierType, actorType);

    const otpResult = await this.MFAService.generateAndSendOTP(
      actorType,
      identity._id,
      identifier,
      channel,
      this.IdentityService.getSigninLocals(identity)
    );

    return {
      success: true,
      message: `OTP code sent via ${channel}`,
      codeSent: otpResult.sent,
      expiresAt: otpResult.expiresAt,
      channel,
      identity
    };
  }
  /**
   * @createIdentity
   */

  async createIdentity(payload, session = null) {
    return await this.IdentityService.create(payload, session);
  }
  /**
   * @verifyIdentifier
   */

  async verifyIdentifier(payload, session = null) {
    return await this.IdentityService.verifyIdentifier(payload, session);
  }
  /**
   * @resendIdentifierVerificationCode
   */

  async resendIdentifierVerificationCode(payload, session = null) {
    return await this.IdentityService.resendIdentifierVerificationCode(payload, session);
  }
  /**
   * @sendPasswordResetCode
   */

  async sendPasswordResetCode(payload, session = null) {
    return await this.IdentityService.sendPasswordResetCode(payload, session);
  }
  /**
   * @verifyPasswordResetCode
   */

  async verifyPasswordResetCode(payload, session = null) {
    return await this.IdentityService.verifyPasswordResetCode(payload, session);
  }
  /**
   * @resetPassword
   */

  async resetPassword(token, password) {
    return await this.IdentityService.resetPassword(token, password);
  }
  /**
   * @changePassword
   */

  async changePassword(payload) {
    return await this.IdentityService.changePassword(payload);
  }
  // ============================================================
  // MFA METHODS
  // ============================================================
  async verifyMFA(accessToken, code) {
    const {
      valid,
      data: session
    } = await this.verifyAccessToken(accessToken, true);

    if (!valid || !session) {
      throw new this.ApiError('Invalid or expired session');
    }

    if (!session.mfa || !session.mfa.isEnabled) {
      throw new this.ApiError('MFA not required for this session');
    }

    if (session.mfaVerified) {
      return {
        success: true,
        verified: true,
        alreadyVerified: true
      };
    }

    const mfaVerification = await this.MFAService.verifySessionMFACode(session, code);

    if (!mfaVerification.verified) {
      throw new this.ApiError('Invalid MFA code');
    }

    await this.SecurityService.logSecurityEvent({
      eventType: this.AuthEnum.AUTH_EVENTS.MFA_VERIFIED,
      userId: session.userId,
      actorType: session.actorType,
      sessionId: session.sessionId,
      ipAddress: session.ipAddress,
      success: true,
      metadata: {
        method: mfaVerification.verificationMethod,
        usedBackupCode: mfaVerification.usedBackupCode
      }
    });

    return {
      success: true,
      verified: true,
      usedBackupCode: mfaVerification.usedBackupCode,
      verificationMethod: mfaVerification.verificationMethod
    };
  }
  /**
   * @activateMFAToken
   */

  async activateMFAToken(accessToken, code) {
    const result = await this.verifyMFA(accessToken, code);
    return {
      tokenIsActivated: result.verified
    };
  }
  /**
   * @resendMFACode
   */

  async resendMFACode(accessToken, channel) {
    const {
      valid,
      data: session
    } = await this.verifyAccessToken(accessToken, true);

    if (!valid || !session) {
      throw new this.ApiError('Invalid or expired session');
    }

    if (!session.mfa || !session.mfa.isEnabled) {
      throw new this.ApiError('MFA not required for this session');
    }

    const identity = await this.IdentityService.findIdentityById(session.userId);
    if (!identity) {
      throw new this.ApiError('User not found');
    }

    const locals = this.IdentityService.getSigninLocals(identity);
    const resendResult = await this.MFAService.resendMFACodeForSession(session, locals, channel);

    return {
      success: true,
      codeSent: resendResult.codeSent,
      method: resendResult.method,
      expiresAt: resendResult.expiresAt,
      remainingResends: resendResult.remainingResends
    };
  }
  /**
   * @getSecuritySummary
   */

  async getSecuritySummary(userId, days = 30) {
    const [securityEvents, sessions, mfaStatus] = await Promise.all([
      this.SecurityService.getSecuritySummary(userId, days),
      this.SessionService.getUserSessions(userId),
      this.MFAService.getMFAStatus('customer', userId)
    ]);

    return {
      securityEvents,
      activeSessions: sessions.length,
      mfaStatus,
      lastActivity: sessions && sessions[0] && sessions[0].lastActivityAt ? sessions[0].lastActivityAt : null,
      riskLevel: sessions && sessions[0] && sessions[0].securityLevel ? sessions[0].securityLevel : this.AuthEnum.SECURITY_LEVELS.LOW
    };
  }
  // ============================================================
  // PRIVATE UTILITY METHODS
  // ============================================================
  _determineAuthType(payload) {
    const {
      code,
      oauthProvider,
      identifierType,
      password,
      otpCode
    } = payload;

    if (code && oauthProvider === 'google') {
      return this.AuthEnum.AUTH_TYPES.GOOGLE;
    }

    if (identifierType && password) {
      if (identifierType === this.AuthEnum.IDENTIFIER_TYPES.EMAIL) {
        return this.AuthEnum.AUTH_TYPES.EMAIL_PASSWORD;
      }
      if (identifierType === this.AuthEnum.IDENTIFIER_TYPES.PHONE) {
        return this.AuthEnum.AUTH_TYPES.PHONE_PASSWORD;
      }
    }

    if (otpCode) {
      return this.AuthEnum.AUTH_TYPES.OTP_ONLY;
    }

    return null;
  }
  /**
   * @_validateAccountStatus
   */

  _validateAccountStatus(identity) {
    if (!identity.isActive) {
      throw new this.ApiError('Account is not active', this.AuthEnum.ERROR_CODES.ACCOUNT_DISABLED);
    }

    if (identity.isBlocked) {
      throw new this.ApiError('Account is blocked', this.AuthEnum.ERROR_CODES.ACCOUNT_BLOCKED);
    }
  }
  /**
   * @_validateAccessLevel
   */

  _validateAccessLevel(accessLevels, identity) {
    if (!accessLevels || accessLevels.length === 0) return true;
    return accessLevels.includes(identity.actorType);
  }
  /**
   * @_blacklistToken
   */

  _blacklistToken(token) {
    this.tokenBlacklist.add(token);
  }
  /**
   * @_isTokenBlacklisted
   */

  _isTokenBlacklisted(token) {
    return this.tokenBlacklist.has(token);
  }
  /**
   * @_logFailedSignin
   */

  async _logFailedSignin(reason, identity, requestInfo, riskAnalysis) {
    const {
      ipAddress,
      userAgent,
      deviceInfo = {}
    } = requestInfo;

    if (identity && identity._id) {
      const failedAttempts = await this.SecurityService.incrementFailedAttempts(identity._id);

      if (this.AuthConfig.shouldEscalateLockout(failedAttempts)) {
        const lockoutDuration = this.AuthConfig.calculateLockoutDuration(failedAttempts);

        if (lockoutDuration === -1) {
          await this.AuthIdentity.updateOne({
            _id: identity._id
          }, {
            $set: {
              isBlocked: true,
              blockReason: 'Too many failed login attempts',
              blockedAt: new Date()
            }
          });

          await this._sendSecurityAlert(identity._id, 'account_locked', {
            reason: 'Permanent lock due to excessive failed attempts',
            failedAttempts
          });
        } else {
          await this.AuthIdentitySecurity.updateOne({
            identity: identity._id
          }, {
            $set: {
              lockedUntil: new Date(Date.now() + lockoutDuration),
              lockReason: 'Escalated lockout due to repeated failures'
            }
          });
        }
      }
    }

    await this.SecurityService.logSecurityEvent({
      eventType: this.AuthEnum.AUTH_EVENTS.LOGIN_FAILED,
      userId: identity && identity._id ? identity._id : null,
      actorType: identity && identity.actorType ? identity.actorType : null,
      ipAddress,
      userAgent,
      device: deviceInfo,
      location: requestInfo.location,
      success: false,
      errorMessage: reason,
      riskLevel: riskAnalysis && riskAnalysis.riskLevel ? riskAnalysis.riskLevel : null,
      riskFactors: riskAnalysis && riskAnalysis.riskFactors ? riskAnalysis.riskFactors : [],
      totalRiskScore: riskAnalysis && riskAnalysis.totalRiskScore ? riskAnalysis.totalRiskScore : 0,
      metadata: {
        identifier: identity && identity.identifier ? identity.identifier : null,
        reason
      }
    });
  }
  /**
   * @_sendSecurityAlert
   */

  async _sendSecurityAlert(userId, alertType, metadata = {}) {
    try {
      const identity = await this.IdentityService.findIdentityById(userId);
      if (!identity) return;

      const alertMessages = {
        new_device: {
          subject: 'New Device Login',
          message: 'A new device was used to access your account'
        },
        suspicious_refresh: {
          subject: 'Suspicious Token Refresh',
          message: 'Suspicious activity detected during token refresh'
        },
        password_change: {
          subject: 'Password Changed',
          message: 'Your password has been changed'
        },
        mfa_change: {
          subject: 'MFA Settings Changed',
          message: 'Your MFA settings have been modified'
        },
        unusual_login: {
          subject: 'Unusual Login Detected',
          message: 'Login from an unusual location or time'
        },
        account_locked: {
          subject: 'Account Locked',
          message: 'Your account has been locked due to security concerns'
        }
      };

      const alert = alertMessages[alertType];
      if (!alert) return;

      const locals = {
        firstName: identity.firstName,
        lastName: identity.lastName,
        alertType: alert.subject,
        alertMessage: alert.message,
        timestamp: new Date().toISOString(),
        ipAddress: metadata.ipAddress || 'Unknown',
        device: metadata.deviceInfo && metadata.deviceInfo.name ? metadata.deviceInfo.name : 'Unknown',
        location: metadata.location ? `${metadata.location.city}, ${metadata.location.country}` : 'Unknown'
      };

      const channel = this.AuthConfig.resolveDefaultChannelFromIdentifier(payload.identifierType)
      let template

      if (payload.identifierType === this.AuthIdentityEnum.IDENTIFIER_TYPES.EMAIL.KEY) {
        locals.email = identity.identifier
        template = this.EMAIL_TEMPLATES.SECURITY_ALERT
      } else if (payload.identifierType === this.AuthIdentityEnum.IDENTIFIER_TYPES.PHONE.KEY) {
        locals.phoneNumber = payload.identifier
        template = this.SMS_TEMPLATES.SECURITY_ALERT
      }

      return await this.MessageDispatcher.sendMessage(locals, channel, template)

    } catch (error) {
      console.error('Failed to send security alert:', error);
    }
  }
  /**
   * @_startSessionCleanupJob
   */

  async _startSessionCleanupJob() {
    const config = this.AuthConfig.getSecurityConfig().sessionManagement;

    if (!config.autoCleanupEnabled) return;

    try {
      await this.SessionService.cleanupExpiredSessions();
      console.log('[SessionCleanup] Expired sessions cleaned up');
    } catch (error) {
      console.error('[SessionCleanup] Error:', error);
    }
  }

}