/**
 * @AuthMiddlewares - Authentication middleware for route protection
 */

const CoreServices = require("../../../shared/services/core.services");
module.exports = class AuthMiddlewares {

  constructor() {
    this.AuthService = new(require("../services/auth.services"))();
    const services = new CoreServices();

    this.Logger = services.Logger;
    this.STATUS_CODES = services.STATUS_CODES;
    this.ERROR_MESSAGES = services.ERROR_MESSAGES;
    this.ERROR_CODES = services.ERROR_CODES;
    this.SUCCESS_MESSAGES = services.SUCCESS_MESSAGES;
    this.asyncHandler = services.asyncHandler;
    this.UnauthorizedError = services.UnauthorizedError;
  }
  /**
   * @authenticate - Require authentication
   * @param {Array} accessLevels - Optional array of allowed actor types
   */
  authenticate(accessLevels = null) {
    return this.asyncHandler(async (req, res, next) => {
      try {
        const token = req.headers["authorization"] ?
          req.headers["authorization"].replace("Bearer ", "") :
          null;

        const authenticateResponse = await this.AuthService.authenticate(token, accessLevels);

        if (authenticateResponse && authenticateResponse.success) {
          req.actor = authenticateResponse.data;
          req.accessToken = token;
          req.session = authenticateResponse.session;
          return next();
        }

        throw new this.UnauthorizedError(
          authenticateResponse.message || this.ERROR_MESSAGES.ACCESS_DENIED,
          authenticateResponse.error || this.ERROR_CODES.ACCESS_DENIED,
          this.STATUS_CODES.UNAUTHORIZED
        );

      } catch (error) {
        next(error);
      }
    });
  }
  /**
   * @optionalAuth - Optional authentication (doesn't fail if not authenticated)
   * @param {Array} accessLevels - Optional array of allowed actor types
   */
  optionalAuth(accessLevels = null) {
    return this.asyncHandler(async (req, res, next) => {
      try {
        const token = req.headers["authorization"] ?
          req.headers["authorization"].replace("Bearer ", "") :
          null;

        if (token) {
          const authenticateResponse = await this.AuthService.authenticate(token, accessLevels);

          if (authenticateResponse && authenticateResponse.success) {
            req.actor = authenticateResponse.data;
            req.accessToken = token;
            req.session = authenticateResponse.session;
          }
        }

        return next();

      } catch (error) {
        next(error);
      }
    });
  }
  /**
   * @requireActorType - Require specific actor type(s)
   * @param {String|Array} actorTypes - Actor type(s) allowed
   */
  requireActorType(actorTypes) {
    const allowedTypes = Array.isArray(actorTypes) ? actorTypes : [actorTypes];

    return this.asyncHandler(async (req, res, next) => {
      if (!req.actor) {
        throw new this.UnauthorizedError(
          'Authentication required',
          this.ERROR_CODES.UNDEFINED_TOKEN,
          this.STATUS_CODES.UNAUTHORIZED
        );
      }

      if (!allowedTypes.includes(req.actor.actorType)) {
        throw new this.UnauthorizedError(
          'Insufficient permissions',
          this.ERROR_CODES.ACCESS_DENIED,
          this.STATUS_CODES.FORBIDDEN
        );
      }

      return next();
    });
  }
  /**
   * @requireMFAVerified - Require MFA verification
   */
  requireMFAVerified() {
    return this.asyncHandler(async (req, res, next) => {
      if (!req.session) {
        throw new this.UnauthorizedError(
          'Session required',
          this.ERROR_CODES.INVALID_TOKEN,
          this.STATUS_CODES.UNAUTHORIZED
        );
      }

      const AuthConfig = require("../config/auth.config");
      const actorConfig = AuthConfig.getActorConfig(req.actor.actorType);

      if (actorConfig.requiresMFA && !req.session.mfaVerified) {
        throw new this.UnauthorizedError(
          'MFA verification required',
          this.ERROR_CODES.MFA_REQUIRED,
          this.STATUS_CODES.UNAUTHORIZED
        );
      }

      return next();
    });
  }
  /**
   * @extractRequestInfo - Extract request information for security logging
   */
  extractRequestInfo(req) {
    return {
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.headers['user-agent'],
      deviceInfo: {
        type: this.detectDeviceType(req.headers['user-agent']),
        userAgent: req.headers['user-agent'],
        fingerprint: req.headers['x-device-fingerprint']
      },
      location: {
        // Can be populated from IP geolocation service
        country: req.headers['cf-ipcountry'] || null, // Cloudflare example
        city: null,
        timezone: req.headers['x-timezone'] || null
      }
    };
  }
  /**
   * @detectDeviceType - Detect device type from user agent
   */
  detectDeviceType(userAgent) {
    if (!userAgent) return 'unknown';

    const ua = userAgent.toLowerCase();

    if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) {
      return 'mobile';
    }
    if (ua.includes('tablet') || ua.includes('ipad')) {
      return 'tablet';
    }
    if (ua.includes('postman') || ua.includes('insomnia') || ua.includes('curl')) {
      return 'api';
    }

    return 'web';
  }

}