/**
 * @SessionServices - Professional session management with device tracking
 */

const CoreServices = require("../../../shared/services/core.services")
module.exports = class SessionServices extends CoreServices {

  constructor() {
    super();
    this.AuthSession = require("../models/session.auth.model");
    this.AuthEnum = require("../enums/auth.enum");
    this.SecurityService = new(require("./security.auth.services"))();
  }
  /**
   * @createSession - Create new session with device tracking
   */
  async createSession(sessionData) {
    const {
      userId,
      actorType,
      accessToken,
      refreshToken,
      accessTokenExpiresAt,
      refreshTokenExpiresAt,
      mfa = {},
      deviceInfo = {},
      ipAddress,
      location = {},
      mfaVerified = false
    } = sessionData;

    // Generate unique session ID
    const sessionId = this.HelperMethods.generateId(32);

    // Determine security level based on device and location
    const securityLevel = await this.calculateSecurityLevel({
      deviceInfo,
      ipAddress,
      location,
      mfaVerified
    });

    // Check concurrent session limits
    await this.enforceSessionLimits(userId, actorType);

    const session = await this.AuthSession.create({
      sessionId,
      userId,
      actorType,
      accessToken,
      refreshToken,
      accessTokenExpiresAt,
      refreshTokenExpiresAt,
      device: {
        type: deviceInfo.type || this.AuthEnum.DEVICE_TYPES.WEB,
        name: deviceInfo.name || "Unknown Device",
        fingerprint: deviceInfo.fingerprint,
        userAgent: deviceInfo.userAgent,
        isTrusted: deviceInfo.isTrusted || false
      },
      mfa: {
        isEnabled: mfa.isEnabled || false,
        code: mfa.code,
        codeExpiresAt: mfa.codeExpiresAt,
        method: mfa.method,
        isCodeSent: false,
        codeVerifiedAt: null,
        attempts: 0,
        lastAttemptAt: null
      },
      ipAddress,
      location,
      mfaVerified,
      securityLevel,
      lastActivityAt: new Date()
    });

    // Log session creation
    await this.SecurityService.logSecurityEvent({
      eventType: this.AuthEnum.AUTH_EVENTS.LOGIN_SUCCESS,
      userId,
      actorType,
      sessionId,
      ipAddress,
      userAgent: deviceInfo.userAgent,
      device: {
        type: deviceInfo.type,
        fingerprint: deviceInfo.fingerprint
      },
      location,
      success: true,
      riskLevel: securityLevel,
      metadata: {
        sessionCreated: true
      }
    });

    return session;
  }
  /**
   * @calculateSecurityLevel - Calculate session security level
   */
  async calculateSecurityLevel(sessionData) {
    const {
      deviceInfo,
      ipAddress,
      mfaVerified
    } = sessionData;

    let level = this.AuthEnum.SECURITY_LEVELS.MEDIUM;

    // Increase security for trusted devices
    if (deviceInfo.isTrusted) {
      level = this.AuthEnum.SECURITY_LEVELS.LOW;
    }

    // Increase security for MFA verified sessions
    if (mfaVerified) {
      level = this.AuthEnum.SECURITY_LEVELS.LOW;
    }

    // Increase security for suspicious IPs
    if (this.SecurityService.isSuspiciousIP(ipAddress)) {
      level = this.AuthEnum.SECURITY_LEVELS.HIGH;
    }

    return level;
  }
  /**
   * @enforceSessionLimits - Enforce concurrent session limits
   */
  async enforceSessionLimits(userId, actorType) {
    const actorConfig = this.AuthEnum.ACTOR_TYPES[actorType.toUpperCase()];
    const maxSessions = actorConfig ? actorConfig.MAX_CONCURRENT_SESSIONS : this.TIME_SETTINGS.MAX_CONCURRENT_SESSIONS;

    // Get active sessions
    const activeSessions = await this.AuthSession.find({
      userId,
      status: this.AuthEnum.SESSION_STATUS.ACTIVE,
      accessTokenExpiresAt: {
        $gt: new Date()
      }
    }).sort({
      lastActivityAt: 1
    }); // Oldest first

    // Remove oldest sessions if limit exceeded
    if (activeSessions.length >= maxSessions) {
      const sessionsToRevoke = activeSessions.slice(0, activeSessions.length - maxSessions + 1);

      for (const session of sessionsToRevoke) {
        await session.revoke('system', 'Session limit exceeded');

        // Log session revocation
        await this.SecurityService.logSecurityEvent({
          eventType: this.AuthEnum.AUTH_EVENTS.SESSION_EXPIRED,
          userId,
          actorType,
          sessionId: session.sessionId,
          ipAddress: session.ipAddress,
          success: true,
          metadata: {
            reason: 'Session limit exceeded'
          }
        });
      }
    }
  }
  /**
   * @findSessionByToken - Find session by token
   */
  async findSessionByToken(token, tokenType = "access") {
    const payload = {
      status: this.AuthEnum.SESSION_STATUS.ACTIVE,
    }
    if (tokenType == 'refresh') {
      payload.refreshToken = token
      payload.refreshTokenExpiresAt = {
        $gt: new Date()
      }
    } else {
      payload.accessToken = token
      payload.accessTokenExpiresAt = {
        $gt: new Date()
      }
    }
    return await this.AuthSession.findOne().populate('userId');
  }
  /**
   * @updateSessionActivity - Update session last activity
   */
  async updateSessionActivity(sessionId, metadata = {}) {
    const session = await this.AuthSession.findOne({
      sessionId
    });
    if (session) {
      session.lastActivityAt = new Date();
      if (metadata.ipAddress && metadata.ipAddress !== session.ipAddress) {
        // IP changed - potential security issue
        await this.markSessionSuspicious(sessionId, 'IP address changed');
      }
      return await session.save();
    }
    return null;
  }
  /**
   * @revokeSession - Revoke specific session
   */
  async revokeSession(sessionId, revokedBy = "user", reason = "Manual logout") {
    const session = await this.AuthSession.findOne({
      sessionId
    });
    if (session) {
      await session.revoke(revokedBy, reason);

      // Log session revocation
      await this.SecurityService.logSecurityEvent({
        eventType: this.AuthEnum.AUTH_EVENTS.LOGOUT,
        userId: session.userId,
        actorType: session.actorType,
        sessionId,
        ipAddress: session.ipAddress,
        success: true,
        metadata: {
          revokedBy,
          reason
        }
      });

      return {
        success: true
      };
    }
    return {
      success: false,
      message: 'Session not found'
    };
  }
  /**
   * @revokeAllSessions - Revoke all sessions for user
   */
  async revokeAllSessions(userId, exceptSessionId = null, revokedBy = "user") {
    const query = {
      userId,
      status: this.AuthEnum.SESSION_STATUS.ACTIVE
    };

    if (exceptSessionId) {
      query.sessionId = {
        $ne: exceptSessionId
      };
    }

    const sessions = await this.AuthSession.find(query);
    let revokedCount = 0;

    for (const session of sessions) {
      await session.revoke(revokedBy, 'All sessions logout');

      // Log session revocation
      await this.SecurityService.logSecurityEvent({
        eventType: this.AuthEnum.AUTH_EVENTS.LOGOUT_ALL,
        userId,
        actorType: session.actorType,
        sessionId: session.sessionId,
        ipAddress: session.ipAddress,
        success: true,
        metadata: {
          revokedBy
        }
      });

      revokedCount++;
    }

    return {
      success: true,
      revokedCount
    };
  }
  /**
   * @markSessionSuspicious - Mark session as suspicious
   */
  async markSessionSuspicious(sessionId, reason) {
    const session = await this.AuthSession.findOne({
      sessionId
    });
    if (session) {
      await session.markSuspicious(reason);

      // Log suspicious activity
      await this.SecurityService.logSecurityEvent({
        eventType: this.AuthEnum.AUTH_EVENTS.SUSPICIOUS_ACTIVITY,
        userId: session.userId,
        actorType: session.actorType,
        sessionId,
        ipAddress: session.ipAddress,
        success: false,
        riskLevel: this.AuthEnum.SECURITY_LEVELS.HIGH,
        errorMessage: reason,
        metadata: {
          suspiciousActivity: true
        }
      });

      return {
        success: true
      };
    }
    return {
      success: false,
      message: 'Session not found'
    };
  }
  /**
   * @getUserSessions - Get all sessions for user
   */
  async getUserSessions(userId, includeExpired = false) {
    const query = {
      userId
    };

    if (!includeExpired) {
      query.status = this.AuthEnum.SESSION_STATUS.ACTIVE;
      query.accessTokenExpiresAt = {
        $gt: new Date()
      };
    }

    return await this.AuthSession.find(query)
      .sort({
        lastActivityAt: -1
      })
      .select('-accessToken -refreshToken');
  }
  /**
   * @cleanupExpiredSessions - Cleanup expired sessions
   */
  async cleanupExpiredSessions() {
    const expiredSessions = await this.AuthSession.find({
      $or: [{
          accessTokenExpiresAt: {
            $lt: new Date()
          }
        },
        {
          refreshTokenExpiresAt: {
            $lt: new Date()
          }
        }
      ],
      status: this.AuthEnum.SESSION_STATUS.ACTIVE
    });

    let cleanedCount = 0;
    for (const session of expiredSessions) {
      session.status = this.AuthEnum.SESSION_STATUS.EXPIRED;
      await session.save();
      cleanedCount++;
    }

    return {
      cleanedCount
    };
  }
  /**
   * @getSessionAnalytics - Get session analytics for user
   */
  async getSessionAnalytics(userId, days = 30) {
    const startDate = new Date(Date.now() - (days * 24 * 60 * 60 * 1000));

    return await this.AuthSession.aggregate([{
        $match: {
          userId: this.mongoose.Types.ObjectId(userId),
          createdAt: {
            $gte: startDate
          }
        }
      },
      {
        $group: {
          _id: {
            deviceType: '$device.type',
            day: {
              $dayOfYear: '$createdAt'
            }
          },
          count: {
            $sum: 1
          },
          avgDuration: {
            $avg: {
              $subtract: ['$lastActivityAt', '$createdAt']
            }
          },
          locations: {
            $addToSet: '$location.country'
          }
        }
      },
      {
        $group: {
          _id: '$_id.deviceType',
          totalSessions: {
            $sum: '$count'
          },
          avgDuration: {
            $avg: '$avgDuration'
          },
          uniqueLocations: {
            $size: {
              $setUnion: '$locations'
            }
          }
        }
      }
    ]);
  }
  /**
   * @trustDevice - Mark device as trusted
   */
  async trustDevice(userId, deviceFingerprint, deviceName) {
    const result = await this.AuthSession.updateMany({
      userId,
      'device.fingerprint': deviceFingerprint
    }, {
      $set: {
        'device.isTrusted': true,
        'device.name': deviceName || 'Trusted Device'
      }
    });

    return {
      success: true,
      modifiedCount: result.modifiedCount
    };
  }
  /**
   * @untrustDevice - Remove device trust
   */
  async untrustDevice(userId, deviceFingerprint) {
    const result = await this.AuthSession.updateMany({
      userId,
      'device.fingerprint': deviceFingerprint
    }, {
      $set: {
        'device.isTrusted': false
      }
    });

    return {
      success: true,
      modifiedCount: result.modifiedCount
    };
  }
  /**
   * @getDeviceList - Get list of user devices
   */
  async getDeviceList(userId) {
    return await this.AuthSession.aggregate([{
        $match: {
          userId: this.mongoose.Types.ObjectId(userId),
          'device.fingerprint': {
            $exists: true,
            $ne: null
          }
        }
      },
      {
        $group: {
          _id: '$device.fingerprint',
          deviceType: {
            $first: '$device.type'
          },
          deviceName: {
            $first: '$device.name'
          },
          isTrusted: {
            $first: '$device.isTrusted'
          },
          lastSeen: {
            $max: '$lastActivityAt'
          },
          totalSessions: {
            $sum: 1
          },
          locations: {
            $addToSet: '$location.country'
          }
        }
      },
      {
        $sort: {
          lastSeen: -1
        }
      }
    ]);
  }

}