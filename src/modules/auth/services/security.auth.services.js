/**
 * @SecurityServices - Rate limiting, brute force protection, and security monitoring
 */

const CoreServices = require("../../../shared/services/core.services")
module.exports = class SecurityServices extends CoreServices {

  constructor() {
    super();
    this.AuthSecurityAudit = require("../models/security.audit.auth.model");
    this.AuthEnum = require("../enums/auth.enum");

    // In-memory rate limiting cache (in production, use Redis)
    this.rateLimitCache = new Map();
    this.suspiciousIPs = new Set();
  }
  /**
   * @incrementFailedAttempts - Increment and return failed login attempts count for a user
   * @param {ObjectId} userId - The user identity ID
   * @returns {Promise<number>} - Total failed attempts in the lockout window
   */
  async incrementFailedAttempts(userId) {
    const lockoutWindow = this.TIME_SETTINGS.ACCOUNT_LOCKOUT_TIME || (30 * 60 * 1000); // 30 minutes default
    const startTime = new Date(Date.now() - lockoutWindow);

    // Count recent failed login attempts from audit log
    const failedAttempts = await this.AuthSecurityAudit.countDocuments({
      userId: userId,
      eventType: this.AuthEnum.AUTH_EVENTS.LOGIN_FAILED,
      success: false,
      createdAt: {
        $gte: startTime
      }
    });

    return failedAttempts;
  }
  /**
   * @checkRateLimit - Check if action is rate limited
   */
  async checkRateLimit(identifier, action, ipAddress) {
    const key = `${action}:${identifier}:${ipAddress}`;
    const now = Date.now();
    const windowStart = now - this.TIME_SETTINGS.LOGIN_ATTEMPT_WINDOW;

    // Get current attempts
    let attempts = this.rateLimitCache.get(key) || [];

    // Remove old attempts outside the time window
    attempts = attempts.filter(timestamp => timestamp > windowStart);

    // Check if rate limit exceeded
    if (attempts.length >= this.TIME_SETTINGS.MAX_LOGIN_ATTEMPTS) {
      await this.logSecurityEvent({
        eventType: this.AuthEnum.AUTH_EVENTS.SUSPICIOUS_ACTIVITY,
        ipAddress,
        success: false,
        errorMessage: `Rate limit exceeded for ${action}`,
        riskLevel: this.AuthEnum.SECURITY_LEVELS.HIGH,
        metadata: {
          action,
          attempts: attempts.length
        }
      });

      return {
        allowed: false,
        remaining: 0,
        resetTime: new Date(Math.max(...attempts) + this.TIME_SETTINGS.LOGIN_ATTEMPT_WINDOW),
        lockoutTime: this.TIME_SETTINGS.ACCOUNT_LOCKOUT_TIME
      };
    }

    // Add current attempt
    attempts.push(now);
    this.rateLimitCache.set(key, attempts);

    return {
      allowed: true,
      remaining: this.TIME_SETTINGS.MAX_LOGIN_ATTEMPTS - attempts.length,
      resetTime: new Date(now + this.TIME_SETTINGS.LOGIN_ATTEMPT_WINDOW),
      attempts: attempts.length
    };
  }
  /**
   * @checkAccountLockout - Check if account is locked due to failed attempts
   */
  async checkAccountLockout(identifier, actorType) {
    const lockoutStart = Date.now() - this.TIME_SETTINGS.ACCOUNT_LOCKOUT_TIME;

    // Count failed login attempts in the lockout window
    const failedAttempts = await this.AuthSecurityAudit.countDocuments({
      eventType: this.AuthEnum.AUTH_EVENTS.LOGIN_FAILED,
      actorType,
      'metadata.identifier': identifier,
      success: false,
      createdAt: {
        $gte: new Date(lockoutStart)
      }
    });

    if (failedAttempts >= this.TIME_SETTINGS.MAX_LOGIN_ATTEMPTS) {
      return {
        isLocked: true,
        unlockTime: new Date(lockoutStart + this.TIME_SETTINGS.ACCOUNT_LOCKOUT_TIME),
        failedAttempts
      };
    }

    return {
      isLocked: false,
      failedAttempts
    };
  }
  /**
   * @analyzeLoginAttempt - Analyze login attempt for suspicious behavior
   */
  async analyzeLoginAttempt(attemptData) {
    const {
      identifier,
      ipAddress,
      userAgent,
      actorType,
      success
    } = attemptData;
    const riskFactors = [];
    let totalRiskScore = 0;

    // Check for unusual location
    const recentLocations = await this.getRecentLoginLocations(identifier, 30);
    if (recentLocations.length > 0) {
      // Simple location check (in production, use proper geolocation)
      const isNewLocation = !recentLocations.some(
        loc => loc && loc.country === (attemptData.location && attemptData.location.country)
      );

      if (isNewLocation) {
        riskFactors.push({
          type: 'unusual_location',
          score: 25,
          description: 'Login from new geographic location'
        });
        totalRiskScore += 25;
      }
    }

    // Check for suspicious IP
    if (this.suspiciousIPs.has(ipAddress)) {
      riskFactors.push({
        type: 'suspicious_ip',
        score: 50,
        description: 'IP address flagged as suspicious'
      });
      totalRiskScore += 50;
    }

    // Check for new device
    const isNewDevice = await this.isNewDevice(identifier, attemptData.device ? attemptData.device.fingerprint : attemptData.device);
    if (isNewDevice) {
      riskFactors.push({
        type: 'new_device',
        score: 15,
        description: 'Login from new device'
      });
      totalRiskScore += 15;
    }

    // Check for velocity (multiple rapid attempts)
    const recentAttempts = await this.getRecentAttempts(identifier, 5); // Last 5 minutes
    if (recentAttempts.length > 3) {
      riskFactors.push({
        type: 'velocity_check',
        score: 30,
        description: 'Multiple rapid login attempts'
      });
      totalRiskScore += 30;
    }

    // Determine risk level
    let riskLevel = this.AuthEnum.SECURITY_LEVELS.LOW;
    if (totalRiskScore >= 100) riskLevel = this.AuthEnum.SECURITY_LEVELS.CRITICAL;
    else if (totalRiskScore >= 50) riskLevel = this.AuthEnum.SECURITY_LEVELS.HIGH;
    else if (totalRiskScore >= 25) riskLevel = this.AuthEnum.SECURITY_LEVELS.MEDIUM;

    return {
      riskLevel,
      riskFactors,
      totalRiskScore,
      requiresMfa: totalRiskScore >= 25,
      shouldBlock: totalRiskScore >= 75
    };
  }
  /**
   * @getRecentLoginLocations - Get recent login locations for user
   */
  async getRecentLoginLocations(identifier, days = 30) {
    const startDate = new Date(Date.now() - (days * 24 * 60 * 60 * 1000));

    return await this.AuthSecurityAudit.aggregate([{
        $match: {
          'metadata.identifier': identifier,
          eventType: this.AuthEnum.AUTH_EVENTS.LOGIN_SUCCESS,
          success: true,
          createdAt: {
            $gte: startDate
          }
        }
      },
      {
        $group: {
          _id: {
            country: '$location.country',
            city: '$location.city'
          },
          count: {
            $sum: 1
          },
          lastSeen: {
            $max: '$createdAt'
          }
        }
      },
      {
        $project: {
          country: '$_id.country',
          city: '$_id.city',
          count: 1,
          lastSeen: 1
        }
      }
    ]);
  }
  /**
   * @isNewDevice - Check if device fingerprint is new for user
   */
  async isNewDevice(identifier, fingerprint) {
    if (!fingerprint) return true;

    const existingDevice = await this.AuthSecurityAudit.findOne({
      'metadata.identifier': identifier,
      'device.fingerprint': fingerprint,
      eventType: this.AuthEnum.AUTH_EVENTS.LOGIN_SUCCESS,
      success: true
    });

    return !existingDevice;
  }
  /**
   * @getRecentAttempts - Get recent login attempts
   */
  async getRecentAttempts(identifier, minutes = 5) {
    const startDate = new Date(Date.now() - (minutes * 60 * 1000));

    return await this.AuthSecurityAudit.find({
      'metadata.identifier': identifier,
      eventType: {
        $in: [this.AuthEnum.AUTH_EVENTS.LOGIN_SUCCESS, this.AuthEnum.AUTH_EVENTS.LOGIN_FAILED]
      },
      createdAt: {
        $gte: startDate
      }
    }).sort({
      createdAt: -1
    });
  }
  /**
   * @logSecurityEvent - Log security event with risk assessment
   */
  async logSecurityEvent(eventData) {
    const auditData = {
      eventId: this.HelperMethods.generateId(16),
      eventType: eventData.eventType,
      userId: eventData.userId || null,
      actorType: eventData.metadata ? eventData.metadata.actorType : null,
      sessionId: eventData.sessionId || null,
      ipAddress: eventData.ipAddress,
      userAgent: eventData.userAgent || '',
      device: eventData.device || {
        type: this.AuthEnum.DEVICE_TYPES.UNKNOWN
      },
      location: eventData.location || {},
      success: eventData.success,
      errorCode: eventData.errorCode || null,
      errorMessage: eventData.errorMessage || null,
      riskLevel: eventData.riskLevel || this.AuthEnum.SECURITY_LEVELS.LOW,
      riskFactors: eventData.riskFactors || [],
      totalRiskScore: eventData.totalRiskScore || 0,
      metadata: eventData.metadata || {},
      actionTaken: eventData.actionTaken || 'none'
    };

    return await this.AuthSecurityAudit.createAuditLog(auditData);
  }
  /**
   * @blockSuspiciousIP - Add IP to suspicious list
   */
  blockSuspiciousIP(ipAddress, reason) {
    this.suspiciousIPs.add(ipAddress);
    // In production, persist this to database/Redis
    this.Logger.warn(`IP ${ipAddress} blocked: ${reason}`);
  }
  /**
   * @isSuspiciousIP - Check if IP is marked as suspicious
   */
  isSuspiciousIP(ipAddress) {
    return this.suspiciousIPs.has(ipAddress);
  }
  /**
   * @clearRateLimit - Clear rate limit for identifier (admin function)
   */
  clearRateLimit(identifier, action, ipAddress) {
    const key = `${action}:${identifier}:${ipAddress}`;
    this.rateLimitCache.delete(key);
  }
  /**
   * @getSecuritySummary - Get security summary for user
   */
  async getSecuritySummary(userId, days = 30) {
    return await this.AuthSecurityAudit.getSecuritySummary(userId, days);
  }
  /**
   * @getFailedLoginAttempts - Get recent failed login attempts
   */
  async getFailedLoginAttempts(identifier, hours = 24) {
    const startDate = new Date(Date.now() - (hours * 60 * 60 * 1000));

    return await this.AuthSecurityAudit.find({
      'metadata.identifier': identifier,
      eventType: this.AuthEnum.AUTH_EVENTS.LOGIN_FAILED,
      success: false,
      createdAt: {
        $gte: startDate
      }
    }).sort({
      createdAt: -1
    }).limit(10);
  }
  /**
   * @detectBruteForceAttack - Detect and respond to brute force attacks
   */
  async detectBruteForceAttack(ipAddress, timeWindow = 300000) {
    // 5 minutes
    const startTime = new Date(Date.now() - timeWindow);

    const failedAttempts = await this.AuthSecurityAudit.countDocuments({
      ipAddress,
      eventType: this.AuthEnum.AUTH_EVENTS.LOGIN_FAILED,
      success: false,
      createdAt: {
        $gte: startTime
      }
    });

    // Different thresholds for different severity levels
    if (failedAttempts >= 20) {
      this.blockSuspiciousIP(ipAddress, 'Brute force attack detected');
      return {
        severity: 'critical',
        action: 'blocked'
      };
    } else if (failedAttempts >= 10) {
      return {
        severity: 'high',
        action: 'monitor'
      };
    } else if (failedAttempts >= 5) {
      return {
        severity: 'medium',
        action: 'flag'
      };
    }

    return {
      severity: 'low',
      action: 'none'
    };
  }

}