/**
 * @AuthEnum - Authentication enumerations and constants
 */

module.exports = Object.freeze({

  /**
   * Authentication Types
   */
  AUTH_TYPES: {
    EMAIL_PASSWORD: 'email_password',
    PHONE_PASSWORD: 'phone_password',
    OTP_ONLY: 'otp_only',
    GOOGLE: 'google_oauth',
    FACEBOOK: 'facebook_oauth',
    APPLE: 'apple_oauth'
  },

  /**
   * Message Channels
   */
  MESSAGE_CHANNELS: {
    EMAIL: 'email',
    SMS: 'sms',
    WHATSAPP: 'whatsapp'
  },

  /**
   * Actor Types with MFA Configuration
   */
  ACTOR_TYPES: { ADMIN: { NAME: "admin", REQUIRES_MFA: false }

  },

  /**
   * Session Status
   */
  SESSION_STATUS: {
    ACTIVE: 'active',
    EXPIRED: 'expired',
    REVOKED: 'revoked',
    SUSPICIOUS: 'suspicious'
  },

  /**
   * Security Levels
   */
  SECURITY_LEVELS: {
    LOW: 'low',
    MEDIUM: 'medium',
    HIGH: 'high',
    CRITICAL: 'critical'
  },

  /**
   * Auth Events for Logging
   */
  AUTH_EVENTS: {
    LOGIN_SUCCESS: 'login_success',
    LOGIN_FAILED: 'login_failed',
    LOGOUT: 'logout',
    TOKEN_REFRESH: 'token_refresh',
    PASSWORD_CHANGE: 'password_change',
    PASSWORD_RESET: 'password_reset',
    MFA_ENABLED: 'mfa_enabled',
    MFA_DISABLED: 'mfa_disabled',
    MFA_VERIFIED: 'mfa_verified',
    MFA_FAILED: 'mfa_failed',
    ACCOUNT_LOCKED: 'account_locked',
    ACCOUNT_UNLOCKED: 'account_unlocked',
    SUSPICIOUS_ACTIVITY: 'suspicious_activity',
    SESSION_CREATED: 'session_created',
    SESSION_REVOKED: 'session_revoked'
  },
  /**
   *  Device types
   */
  DEVICE_TYPES: {
    WEB: "web",
    MOBILE: "mobile",
    TABLET: "tablet",
    DESKTOP: "desktop",
    API: "api",
    UNKNOWN: "unknown"
  },

  /**
   * Error Codes
   */
  ERROR_CODES: {
    INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
    ACCOUNT_LOCKED: 'ACCOUNT_LOCKED',
    ACCOUNT_DISABLED: 'ACCOUNT_DISABLED',
    ACCOUNT_BLOCKED: 'ACCOUNT_BLOCKED',
    MFA_REQUIRED: 'MFA_REQUIRED',
    INVALID_MFA_CODE: 'INVALID_MFA_CODE',
    EXPIRED_TOKEN: 'EXPIRED_TOKEN',
    INVALID_TOKEN: 'INVALID_TOKEN',
    UNDEFINED_TOKEN: 'UNDEFINED_TOKEN',
    ACCESS_DENIED: 'ACCESS_DENIED',
    RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
    SESSION_EXPIRED: 'SESSION_EXPIRED',
    CAN_NOT_FIND: 'CAN_NOT_FIND'
  },

  /**
   * Identifier Types
   */
  IDENTIFIER_TYPES: {
    EMAIL: 'email',
    PHONE: 'phone',
    USERNAME: 'username'
  },

  /**
   * Token Types
   */
  TOKEN_TYPES: {
    ACCESS: 'access',
    REFRESH: 'refresh',
    RESET_PASSWORD: 'reset_password',
    VERIFY_EMAIL: 'verify_email',
    VERIFY_PHONE: 'verify_phone'
  }

});