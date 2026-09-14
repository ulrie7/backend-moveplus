/**
 * @AuthValidations - Validation service for authentication operations
 */

const CoreServices = require("../../../shared/services/core.services");
module.exports = class AuthValidations extends CoreServices {

  constructor() {
    super();
    this.AuthEnum = require("../enums/auth.enum");
    this.IdentifierAuthEnum = require("../enums/identity.auth.enum");
  }
  /**
   * @validateSigninPayload - Validate signin request payload
   */
  validateSigninPayload(payload) {
    const errors = [];

    if (!payload.identity) {
      errors.push('Identity ID is required');
    }

    if (!payload.actorType) {
      errors.push('Actor type is required');
    }

    // Validate actor type
    const validActorTypes = Object.values(this.AuthEnum.ACTOR_TYPES).map(type => type.NAME);
    if (payload.actorType && !validActorTypes.includes(payload.actorType)) {
      errors.push('Invalid actor type');
    }

    // Check if at least one auth method is provided
    const hasPassword = !!payload.password;
    const hasOTP = !!payload.otpCode;
    const hasOAuth = !!payload.code && !!payload.oauthProvider;

    if (!hasPassword && !hasOTP && !hasOAuth) {
      errors.push('Authentication credentials required (password, OTP, or OAuth code)');
    }

    // Validate OTP channel if OTP is used
    if (hasOTP && payload.channel) {
      const validChannels = Object.values(this.AuthEnum.MESSAGE_CHANNELS);
      if (!validChannels.includes(payload.channel)) {
        errors.push('Invalid OTP channel');
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
  /**
   * @validateCreateIdentityPayload - Validate create identity payload
   */
  validateCreateIdentityPayload(payload) {
    const errors = [];

    if (!payload.firstName || payload.firstName.trim() === '') {
      errors.push('First name is required');
    }

    if (!payload.identifier || payload.identifier.trim() === '') {
      errors.push('Identifier is required');
    }

    if (!payload.identifierType) {
      errors.push('Identifier type is required');
    }

    if (!payload.actorType) {
      errors.push('Actor type is required');
    }

    // Validate identifier type
    const validIdentifierTypes = Object.values(this.IdentifierAuthEnum.IDENTIFIER_TYPES).map(type => type.KEY);
    if (payload.identifierType && !validIdentifierTypes.includes(payload.identifierType)) {
      errors.push('Invalid identifier type');
    }

    // Validate identifier format
    if (payload.identifier && payload.identifierType) {
      if (payload.identifierType === this.IdentifierAuthEnum.IDENTIFIER_TYPES.EMAIL.KEY) {
        if (!this.isValidEmail(payload.identifier)) {
          errors.push('Invalid email format');
        }
      } else if (payload.identifierType === this.IdentifierAuthEnum.IDENTIFIER_TYPES.PHONE.KEY) {
        if (!this.isValidPhoneNumber(payload.identifier)) {
          errors.push('Invalid phone number format');
        }
      }
    }



    return {
      valid: errors.length === 0,
      errors
    };
  }
  /**
   * @validatePasswordResetPayload - Validate password reset payload
   */
  validatePasswordResetPayload(payload) {
    const errors = [];

    if (!payload.token) {
      errors.push('Reset token is required');
    }

    if (!payload.password) {
      errors.push('New password is required');
    }


    return {
      valid: errors.length === 0,
      errors
    };
  }
  /**
   * @validateChangePasswordPayload - Validate change password payload
   */
  validateChangePasswordPayload(payload) {
    const errors = [];

    if (!payload.id) {
      errors.push('User ID is required');
    }

    if (!payload.oldPassword) {
      errors.push('Current password is required');
    }

    if (!payload.newPassword) {
      errors.push('New password is required');
    }

    if (payload.oldPassword === payload.newPassword) {
      errors.push('New password must be different from current password');
    }


    return {
      valid: errors.length === 0,
      errors
    };
  }
  /**
   * @validateOTPRequestPayload - Validate OTP request payload
   */
  validateOTPRequestPayload(payload) {
    const errors = [];

    if (!payload.identifier) {
      errors.push('Identifier is required');
    }

    if (!payload.actorType) {
      errors.push('Actor type is required');
    }

    if (!payload.channel) {
      errors.push('Channel is required');
    }

    const validChannels = Object.values(this.AuthEnum.MESSAGE_CHANNELS);
    if (payload.channel && !validChannels.includes(payload.channel)) {
      errors.push('Invalid channel');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
  /**
   * @validateMFAConfigPayload - Validate MFA configuration payload
   */
  validateMFAConfigPayload(payload) {
    const errors = [];

    if (!payload.actorType) {
      errors.push('Actor type is required');
    }

    if (!payload.actorId) {
      errors.push('Actor ID is required');
    }

    if (!payload.method) {
      errors.push('MFA method is required');
    }

    const MFAConfigEnum = require("../enums/mfaconfig.auth.enum");
    const validMethods = Object.values(MFAConfigEnum.METHODS);
    if (payload.method && !validMethods.includes(payload.method)) {
      errors.push('Invalid MFA method');
    }

    // Validate contact info based on method
    if (payload.method === MFAConfigEnum.METHODS.SMS ||
      payload.method === MFAConfigEnum.METHODS.WHATSAPP) {
      if (!payload.phoneNumber) {
        errors.push(`Phone number is required for ${payload.method}`);
      } else if (!this.isValidPhoneNumber(payload.phoneNumber)) {
        errors.push('Invalid phone number format');
      }
    }

    if (payload.method === MFAConfigEnum.METHODS.EMAIL) {
      if (!payload.emailAddress) {
        errors.push('Email address is required for email MFA');
      } else if (!this.isValidEmail(payload.emailAddress)) {
        errors.push('Invalid email format');
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
  /**
   * @isValidEmail - Validate email format
   */
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
  /**
   * @isValidPhoneNumber - Validate phone number format
   */
  isValidPhoneNumber(phone) {
    const cleaned = phone.replace(/[\s\-\(\)]/g, '');
    const phoneRegex = /^\+?[1-9]\d{9,14}$/;
    return phoneRegex.test(cleaned);
  }
  /**
   * @validateVerificationCodePayload - Validate verification code payload
   */
  validateVerificationCodePayload(payload) {
    const errors = [];

    if (!payload.identity) {
      errors.push('Identity ID is required');
    }

    if (!payload.code) {
      errors.push('Verification code is required');
    }

    if (payload.code && (payload.code.length < 4 || payload.code.length > 8)) {
      errors.push('Invalid verification code format');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
  /**
   * @validateRefreshTokenPayload - Validate refresh token payload
   */
  validateRefreshTokenPayload(payload) {
    const errors = [];

    if (!payload.refreshToken) {
      errors.push('Refresh token is required');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

}