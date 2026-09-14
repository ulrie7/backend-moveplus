/**
 * @RequestContextMiddleware
 * Collects and attaches contextual request information (IP, device, location, etc.)
 * to req.requestInfo for downstream usage.
 */
module.exports = class RequestContextMiddlewareMiddlewares {

  constructor() {
    // You can inject dependencies here later (logger, config, etc.)
  }
  /**
   * @handler
   */
  handler(req, res, next) {
    try {
      let ip = 'Unknown';

      if (req.headers && req.headers['x-forwarded-for']) {
        const forwarded = req.headers['x-forwarded-for'].split(',');
        ip = forwarded.length > 0 ? forwarded[0].trim() : 'Unknown';
      } else if (req.socket && req.socket.remoteAddress) {
        ip = req.socket.remoteAddress;
      } else if (req.ip) {
        ip = req.ip;
      }

      const userAgent = req.headers && req.headers['user-agent'] ?
        req.headers['user-agent'] :
        'Unknown';

      const deviceInfo = {
        fingerprint: req.headers && req.headers['x-device-id'] ?
          req.headers['x-device-id'] : null,
        name: req.headers && req.headers['x-device-name'] ?
          req.headers['x-device-name'] : 'Unknown',
        type: req.headers && req.headers['x-device-type'] ?
          req.headers['x-device-type'] : this.detectDeviceType(userAgent),
      };

      const location = {
        country: req.headers && req.headers['cf-ipcountry'] ?
          req.headers['cf-ipcountry'] : null,
        city: req.headers && req.headers['cf-ipcity'] ?
          req.headers['cf-ipcity'] : null,
      };

      const authContext = {
        sessionId: req.headers && req.headers['x-session-id'] ?
          req.headers['x-session-id'] : null,
      };

      req.requestInfo = {
        ipAddress: ip,
        userAgent,
        deviceInfo,
        location,
        authContext,
        requestedAt: new Date().toISOString(),
      };

      next();
    } catch (error) {
      next(error);
    }
  }
  /**
   * @detectDeviceType - Infer device type from User-Agent
   */
  detectDeviceType(userAgent) {
    if (typeof userAgent !== 'string' || !userAgent) return 'desktop';
    const lowerUA = userAgent.toLowerCase();
    if (lowerUA.includes('mobile')) return 'mobile';
    if (lowerUA.includes('tablet')) return 'tablet';
    return 'desktop';
  }

}