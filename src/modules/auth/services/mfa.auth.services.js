/**
 * @MFAServices - Simplified Multi-Factor Authentication service
 * Supports: Email, SMS, WhatsApp, TOTP, Backup Codes, Device Trust, OTP-only auth
 */

const CoreServices = require("../../../shared/services/core.services");
const crypto = require('crypto');
module.exports = class MFAServices extends CoreServices {

  constructor() {
    super();
    this.MFAConfig = require("../models/mfaconfig.auth.model");
    this.MFAConfigEnum = require("../enums/mfaconfig.auth.enum");
    this.AuthEnum = require("../enums/auth.enum");
  } // ============================================================
  // MFA SCHEMA & CONFIGURATION
  // ============================================================

  /**
   * @getSchema - Get MFA schema for signin process (SESSION-BASED)
   * Now returns data to be stored in the SESSION, not in MFAConfig
   */
  async getSchema(actorType, actorId, locals) {
    const AuthConfig = require("../config/auth.config");
    const actorConfig = AuthConfig.getActorConfig(actorType);

    if (!actorConfig.requiresMFA) {
      return {
        isEnabled: false
      };
    }

    const code = this.HelperMethods.generateId(4, false);
    const codeExpiresAt = Date.now() + (1000 * 60 * 15); // 15 minutes

    const handleMFAResponse = await this.handleMFAProcess(actorType, actorId, code, locals);

    // Return MFA data to be stored in SESSION
    return {
      isEnabled: handleMFAResponse.mfaEnable,
      isCodeSent: handleMFAResponse.sent,
      method: handleMFAResponse.method,
      contactId: handleMFAResponse.contactId,
      code: handleMFAResponse.mfaEnable ? await this.HelperMethods.generateBcryptHash(code) : null,
      codeExpiresAt: handleMFAResponse.mfaEnable ? codeExpiresAt : null,
      attempts: 0,
      lastAttemptAt: null,
      codeVerifiedAt: null
    };
  }
  /**
   * @handleMFAProcess - Handle MFA code sending
   */
  async handleMFAProcess(actorType, actorId, code, locals) {
    const mfaConfig = await this.getMFAConfig(actorType, actorId);

    // Default to email if no config
    if (!mfaConfig) {
      const emailResponse = await this.sendMFAMessage(
        code,
        this.MFAConfigEnum.METHODS.EMAIL,
        locals
      );
      return {
        mfaEnable: true,
        sent: emailResponse.sent,
        contactId: emailResponse.contactId,
        method: this.MFAConfigEnum.METHODS.EMAIL
      };
    }

    // MFA disabled
    if (!mfaConfig.isEnabled || mfaConfig.method === this.MFAConfigEnum.METHODS.NONE) {
      return {
        mfaEnable: false,
        sent: false
      };
    }

    // TOTP doesn't need to send anything
    if (mfaConfig.method === this.MFAConfigEnum.METHODS.TOTP) {
      return {
        mfaEnable: true,
        sent: false,
        contactId: null,
        method: this.MFAConfigEnum.METHODS.TOTP
      };
    }

    // Send MFA code via configured method
    const response = await this.sendMFAMessage(code, mfaConfig.method, locals);

    return {
      mfaEnable: true,
      sent: response.sent,
      contactId: response.contactId,
      method: mfaConfig.method
    };
  }
  /**
   * @configureMFA - Configure MFA settings for user
   */
  async configureMFA(payload) {
    const schema = {
      actorType: payload.actorType,
      actorId: payload.actorId,
      method: payload.method,
      isEnabled: payload.method !== this.MFAConfigEnum.METHODS.NONE,
      phoneNumber: [this.MFAConfigEnum.METHODS.SMS, this.MFAConfigEnum.METHODS.WHATSAPP].includes(payload.method) ?
        payload.phoneNumber : null,
      emailAddress: payload.method === this.MFAConfigEnum.METHODS.EMAIL ?
        payload.emailAddress : null
    };

    // Validate contact info
    if (schema.method === this.MFAConfigEnum.METHODS.SMS && !schema.phoneNumber) {
      schema.isEnabled = false;
    } else if (schema.method === this.MFAConfigEnum.METHODS.WHATSAPP && !schema.phoneNumber) {
      schema.isEnabled = false;
    } else if (schema.method === this.MFAConfigEnum.METHODS.EMAIL && !schema.emailAddress) {
      schema.isEnabled = false;
    }

    const configExist = await this.MFAConfig.findOne({
      actorType: schema.actorType,
      actorId: schema.actorId
    });

    let data;
    if (configExist) {
      await configExist.updateOne(schema);
      data = await this.MFAConfig.findOne({
        actorType: schema.actorType,
        actorId: schema.actorId
      });
    } else {
      data = await this.MFAConfig.create(schema);
    }

    return data;
  }
  /**
   * @getMFAConfig - Get MFA configuration for user
   */
  async getMFAConfig(actorType, actorId) {
    return await this.MFAConfig.findOne({
      actorType,
      actorId
    });
  }
  /**
   * @getMFAStatus - Get MFA status for user
   */
  async getMFAStatus(actorType, actorId) {
    const mfaConfig = await this.MFAConfig.findOne({
      actorType,
      actorId
    });

    if (!mfaConfig) {
      return {
        enabled: false,
        method: this.MFAConfigEnum.METHODS.NONE,
        backupCodesCount: 0,
        trustedDevicesCount: 0
      };
    }

    const remainingBackupCodes = mfaConfig.backupCodes.filter(c => !c.used).length;
    const activeTrustedDevices = mfaConfig.trustedDevices.filter(
      device => !device.expiresAt || device.expiresAt > new Date()
    ).length;

    return {
      enabled: mfaConfig.isEnabled,
      method: mfaConfig.method,
      totpVerified: mfaConfig.totp && mfaConfig.totp.isVerified ? mfaConfig.totp.isVerified : false,
      backupCodesCount: remainingBackupCodes,
      trustedDevicesCount: activeTrustedDevices,
      isLocked: mfaConfig.recovery && mfaConfig.recovery.isLocked ? mfaConfig.recovery.isLocked : false,
      lockedUntil: (
          mfaConfig &&
          mfaConfig.recovery &&
          mfaConfig.recovery.isLocked &&
          mfaConfig.recovery.lockedAt
        ) ?
        new Date(
          mfaConfig.recovery.lockedAt.getTime() +
          this.MFAConfigEnum.RECOVERY.LOCKOUT_DURATION
        ) : null
    };
  }
  // ============================================================
  // SEND MFA CODES
  // ============================================================
  /**
   * Send MFA message via specified method/channel
   * @private
   * @param {string} code - MFA code
   * @param {string} method - MFA method (email/sms/whatsapp)
   * @param {Object} locals - Message data
   * @returns {Promise<{sent: boolean, contactId: string}>}
   */
  async sendMFAMessage(code, method, locals) {
    try {
      const messageData = {
        ...locals,
        code
      };

      let channel;
      let template;

      switch (method) {
        case this.MFAConfigEnum.METHODS.EMAIL:
        case this.AuthEnum.MESSAGE_CHANNELS.EMAIL:
          channel = this.MessageDispatcher.CHANNELS.EMAIL;
          template = this.EMAIL_TEMPLATES.MFA_EMAIL;
          break;

        case this.MFAConfigEnum.METHODS.SMS:
        case this.AuthEnum.MESSAGE_CHANNELS.SMS:
          channel = this.MessageDispatcher.CHANNELS.SMS;
          template = this.SMS_TEMPLATES.MFA_SMS;
          break;

        case this.MFAConfigEnum.METHODS.WHATSAPP:
        case this.AuthEnum.MESSAGE_CHANNELS.WHATSAPP:
          channel = this.MessageDispatcher.CHANNELS.WHATSAPP;
          template = this.SMS_TEMPLATES.MFA_PHONE;
          break;

        default:
          throw new this.ApiError(`Invalid MFA method/channel: ${method}`);
      }

      const response = await this.MessageDispatcher.sendMessage(
        messageData,
        channel,
        template
      );

      return {
        sent: response.sent,
        contactId: response.contactId
      };

    } catch (error) {
      console.error('[sendMFAMessage] Failed to send MFA message:', error.message);
      throw error;
    }
  }
  // ============================================================
  // VERIFY MFA CODE (SESSION-BASED)
  // ============================================================

  /**
   * @verifySessionMFACode - Verify MFA code stored in SESSION
   * This is the main method for verifying MFA during signin
   */
  async verifySessionMFACode(session, code) {
    // Check if session has MFA enabled
    if (!session.mfa || !session.mfa.isEnabled) {
      throw new this.ApiError('MFA not enabled for this session');
    }

    // Check if code has expired
    if (Date.now() > session.mfa.codeExpiresAt) {
      throw new this.ApiError('MFA code has expired');
    }

    // Check attempts limit
    const maxAttempts = 5;
    if (session.mfa.attempts >= maxAttempts) {
      throw new this.ApiError('Too many failed attempts. Please request a new code');
    }

    let verified = false;
    let usedBackupCode = false;
    let verificationMethod = null;

    // Try the method configured in session
    switch (session.mfa.method) {
      case this.MFAConfigEnum.METHODS.EMAIL:
      case this.MFAConfigEnum.METHODS.SMS:
      case this.MFAConfigEnum.METHODS.WHATSAPP:
        // Verify against the hashed code stored in session
        if (session.mfa.code) {
          verified = await this.bcrypt.compare(code, session.mfa.code);
          verificationMethod = session.mfa.method;
        }
        break;

      case this.MFAConfigEnum.METHODS.TOTP:
        // Verify TOTP code
        const totpResult = await this.verifyTOTPForSession(session, code);
        verified = totpResult.verified;
        usedBackupCode = totpResult.usedBackupCode;
        verificationMethod = totpResult.usedBackupCode ? 'backup_code' : this.MFAConfigEnum.METHODS.TOTP;
        break;

      default:
        throw new this.ApiError('Invalid MFA method');
    }

    if (verified) {
      // Update session
      session.mfa.codeVerifiedAt = new Date();
      session.mfa.attempts = 0;
      session.mfaVerified = true;
      await session.save();

      return {
        verified: true,
        usedBackupCode,
        verificationMethod,
        session
      };
    } else {
      // Increment attempts
      session.mfa.attempts = (session.mfa.attempts || 0) + 1;
      session.mfa.lastAttemptAt = new Date();
      await session.save();

      throw new this.ApiError(`Invalid MFA code. ${maxAttempts - session.mfa.attempts} attempts remaining`);
    }
  }
  /**
   * @verifyTOTPForSession - Verify TOTP code for a session
   */
  async verifyTOTPForSession(session, code) {
    const mfaConfig = await this.MFAConfig.findOne({
      actorType: session.actorType,
      actorId: session.userId
    }).select('+totp.secret +backupCodes.code');

    if (!mfaConfig) {
      throw new this.ApiError('MFA configuration not found');
    }

    // Check if account is locked
    if (mfaConfig.recovery && mfaConfig.recovery.isLocked) {
      const lockExpiry = new Date(
        mfaConfig.recovery.lockedAt.getTime() + this.MFAConfigEnum.RECOVERY.LOCKOUT_DURATION
      );
      if (Date.now() < lockExpiry.getTime()) {
        throw new this.ApiError(`MFA locked until ${lockExpiry.toISOString()}`);
      } else {
        mfaConfig.recovery.isLocked = false;
        mfaConfig.recovery.failedAttempts = 0;
        await mfaConfig.save();
      }
    }

    let verified = false;
    let usedBackupCode = false;

    // Try TOTP if configured
    if (mfaConfig.totp && mfaConfig.totp.secret && mfaConfig.totp.isVerified) {
      const totpVerification = this.verifyTOTPCode(mfaConfig.totp.secret, code);
      if (totpVerification.valid) {
        verified = true;
        mfaConfig.totp.lastUsed = new Date();
        mfaConfig.totp.failedAttempts = 0;
      }
    }

    // Try backup codes if TOTP failed
    if (!verified && mfaConfig.backupCodes && mfaConfig.backupCodes.length > 0) {
      for (let i = 0; i < mfaConfig.backupCodes.length; i++) {
        const backupCode = mfaConfig.backupCodes[i];
        if (!backupCode.used && backupCode.code && await this.bcrypt.compare(code, backupCode.code)) {
          verified = true;
          usedBackupCode = true;
          backupCode.used = true;
          backupCode.usedAt = new Date();
          break;
        }
      }
    }

    if (verified) {
      if (mfaConfig.recovery) {
        mfaConfig.recovery.failedAttempts = 0;
        mfaConfig.recovery.lastFailedAttempt = null;
      }
      await mfaConfig.save();

      return {
        verified: true,
        usedBackupCode
      };
    } else {
      // Handle failed attempt
      if (!mfaConfig.recovery) {
        mfaConfig.recovery = {};
      }
      mfaConfig.recovery.failedAttempts = (mfaConfig.recovery.failedAttempts || 0) + 1;
      mfaConfig.recovery.lastFailedAttempt = new Date();

      if (mfaConfig.recovery.failedAttempts >= this.MFAConfigEnum.RECOVERY.LOCKOUT_ATTEMPTS) {
        mfaConfig.recovery.isLocked = true;
        mfaConfig.recovery.lockedAt = new Date();
        mfaConfig.recovery.lockReason = 'Too many failed MFA attempts';
      }

      await mfaConfig.save();
      return {
        verified: false,
        usedBackupCode: false
      };
    }
  }
  /**
   * @resendMFACodeForSession - Resend MFA code for a session
   */
  async resendMFACodeForSession(session, locals, channel) {
    if (!session.mfa || !session.mfa.isEnabled) {
      throw new this.ApiError('MFA not enabled for this session');
    }

    // Don't resend for TOTP
    if (session.mfa.method === this.MFAConfigEnum.METHODS.TOTP) {
      throw new this.ApiError('TOTP codes cannot be resent. Use your authenticator app');
    }

    // Generate new code
    const code = this.HelperMethods.generateId(4, false);
    const codeExpiresAt = Date.now() + (1000 * 60 * 15); // 15 minutes

    // Send code based on method
    const response = await this.sendMFAMessage(code, channel || session.mfa.method, locals);

    // Update session
    session.mfa.code = await this.HelperMethods.generateBcryptHash(code);
    session.mfa.codeExpiresAt = codeExpiresAt;
    session.mfa.contactId = response.contactId;
    session.mfa.isCodeSent = response.sent;
    session.mfa.attempts = 0;
    await session.save();

    return {
      success: true,
      codeSent: response.sent,
      method: session.mfa.method,
      expiresAt: codeExpiresAt
    };
  }
  // ============================================================
  // TOTP (Time-based One-Time Password)
  // ============================================================

  /**
   * @setupTOTP - Setup TOTP for user
   */
  async setupTOTP(actorType, actorId, identifier) {
    const totpData = this.generateTOTPSecret(identifier);

    await this.MFAConfig.findOneAndUpdate({
      actorType,
      actorId
    }, {
      $set: {
        method: this.MFAConfigEnum.METHODS.TOTP,
        isEnabled: false,
        'totp.secret': await this.HelperMethods.generateBcryptHash(totpData.secret),
        'totp.qrCode': totpData.qrCodeUrl,
        'totp.isVerified': false
      }
    }, {
      upsert: true,
      new: true
    });

    return {
      qrCodeUrl: totpData.qrCodeUrl,
      manualEntry: totpData.secret,
      backupCodes: []
    };
  }
  /**
   * @verifyTOTPSetup - Verify TOTP setup with first code
   */
  async verifyTOTPSetup(actorType, actorId, code) {
    const mfaConfig = await this.MFAConfig.findOne({
        actorType,
        actorId
      })
      .select('+totp.secret +backupCodes.code');

    if (!mfaConfig || !mfaConfig.totp || !mfaConfig.totp.secret) {
      throw new this.ApiError('TOTP not configured');
    }

    const verification = this.verifyTOTPCode(mfaConfig.totp.secret, code);

    if (!verification.valid) {
      if (!mfaConfig.totp.failedAttempts) {
        mfaConfig.totp.failedAttempts = 0;
      }
      mfaConfig.totp.failedAttempts = mfaConfig.totp.failedAttempts + 1;
      await mfaConfig.save();
      throw new this.ApiError('Invalid TOTP code');
    }

    // Generate backup codes
    const backupCodes = this.generateBackupCodes();

    mfaConfig.isEnabled = true;
    mfaConfig.totp.isVerified = true;
    mfaConfig.totp.lastUsed = new Date();
    mfaConfig.totp.failedAttempts = 0;
    mfaConfig.backupCodes = await Promise.all(
      backupCodes.map(async code => ({
        code: await this.HelperMethods.generateBcryptHash(code),
        used: false
      }))
    );

    await mfaConfig.save();

    return {
      verified: true,
      backupCodes: backupCodes
    };
  }
  /**
   * @generateTOTPSecret - Generate TOTP secret
   */
  generateTOTPSecret(identifier, issuer = "YourApp") {
    const secret = this.generateBase32Secret();

    const totpUrl = `otpauth://totp/${encodeURIComponent(issuer)}:${encodeURIComponent(identifier)}?secret=${secret}&issuer=${encodeURIComponent(issuer)}&digits=${this.MFAConfigEnum.TOTP_CONFIG.DIGITS}&period=${this.MFAConfigEnum.TOTP_CONFIG.STEP}`;

    return {
      secret,
      qrCodeUrl: totpUrl,
      manualEntry: secret
    };
  }
  /**
   * @generateBase32Secret - Generate base32 encoded secret
   */
  generateBase32Secret(length = 32) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }
  /**
   * @verifyTOTPCode - Verify TOTP code
   */
  verifyTOTPCode(secret, token, window = 1) {
    const currentTime = Math.floor(Date.now() / 1000 / this.MFAConfigEnum.TOTP_CONFIG.STEP);

    for (let i = -window; i <= window; i++) {
      const timeSlot = currentTime + i;
      const expectedToken = this.generateTOTPToken(secret, timeSlot);

      if (this.constantTimeCompare(expectedToken, token)) {
        return {
          valid: true,
          timeSlot
        };
      }
    }

    return {
      valid: false
    };
  }
  /**
   * @generateTOTPToken - Generate TOTP token
   */
  generateTOTPToken(secret, timeSlot) {
    const secretBuffer = this.base32ToBuffer(secret);

    const timeBuffer = Buffer.alloc(8);
    timeBuffer.writeUInt32BE(0, 0);
    timeBuffer.writeUInt32BE(timeSlot, 4);

    const hmac = crypto.createHmac(this.MFAConfigEnum.TOTP_CONFIG.ALGORITHM, secretBuffer);
    hmac.update(timeBuffer);
    const hash = hmac.digest();

    const offset = hash[hash.length - 1] & 0x0f;
    const code = (hash.readUInt32BE(offset) & 0x7fffffff) % Math.pow(10, this.MFAConfigEnum.TOTP_CONFIG.DIGITS);

    return code.toString().padStart(this.MFAConfigEnum.TOTP_CONFIG.DIGITS, '0');
  }
  /**
   * @base32ToBuffer - Convert base32 to buffer
   */
  base32ToBuffer(base32) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    let bits = '';

    for (const char of base32.toUpperCase()) {
      const index = chars.indexOf(char);
      if (index === -1) throw new Error('Invalid base32 character');
      bits += index.toString(2).padStart(5, '0');
    }

    const bytes = [];
    for (let i = 0; i < bits.length; i += 8) {
      if (i + 8 <= bits.length) {
        bytes.push(parseInt(bits.substr(i, 8), 2));
      }
    }

    return Buffer.from(bytes);
  }
  /**
   * @constantTimeCompare - Constant time string comparison
   */
  constantTimeCompare(a, b) {
    if (a.length !== b.length) return false;
    let result = 0;
    for (let i = 0; i < a.length; i++) {
      result |= a.charCodeAt(i) ^ b.charCodeAt(i);
    }
    return result === 0;
  }
  // ============================================================
  // OTP (One-Time Password) for Passwordless Auth
  // ============================================================

  /**
   * @generateAndSendOTP - Generate and send OTP code
   * Note: For passwordless auth, NOT for MFA during signin
   */
  async generateAndSendOTP(actorType, actorId, identifier, channel, locals = {}) {
    const code = this.HelperMethods.generateId(4, false);
    const expiresAt = Date.now() + (1000 * 60 * 15); // 15 minutes

    // Store OTP in MFA config (this is for passwordless auth, not signin MFA)
    await this.MFAConfig.findOneAndUpdate({
      actorType,
      actorId
    }, {
      $set: {
        'otp.code': await this.HelperMethods.generateBcryptHash(code),
        'otp.expiresAt': expiresAt,
        'otp.attempts': 0,
        'otp.channel': channel,
        'otp.identifier': identifier
      }
    }, {
      upsert: true,
      new: true
    });

    // Add identifier to locals
    const messageLocals = {
      ...locals,
      ...(channel === this.AuthEnum.MESSAGE_CHANNELS.EMAIL ? {
        email: identifier
      } : {
        phoneNumber: identifier
      })
    };

    // Send OTP
    const response = await this.sendMFAMessage(code, channel, messageLocals);

    return {
      sent: response.sent,
      contactId: response.contactId,
      expiresAt,
      channel
    };
  }
  /**
   * @verifyOTPCode - Verify OTP code (for passwordless auth)
   */
  async verifyOTPCode(actorType, identifier, code, channel) {
    const mfaConfig = await this.MFAConfig.findOne({
      actorType,
      'otp.identifier': identifier,
      'otp.channel': channel
    }).select('+otp.code');

    if (!mfaConfig || !mfaConfig.otp || !mfaConfig.otp.code) {
      return {
        verified: false,
        error: 'No OTP found'
      };
    }

    // Check expiry
    if (Date.now() > mfaConfig.otp.expiresAt) {
      return {
        verified: false,
        error: 'OTP expired'
      };
    }

    // Check attempts
    if (mfaConfig.otp.attempts >= 5) {
      return {
        verified: false,
        error: 'Too many attempts'
      };
    }

    // Verify code
    const isValid = await this.bcrypt.compare(code, mfaConfig.otp.code);

    if (isValid) {
      // Clear OTP
      mfaConfig.otp = {
        code: null,
        expiresAt: null,
        attempts: 0,
        channel: null,
        identifier: null
      };
      await mfaConfig.save();

      return {
        verified: true
      };
    } else {
      // Increment attempts
      mfaConfig.otp.attempts = (mfaConfig.otp.attempts || 0) + 1;
      await mfaConfig.save();

      return {
        verified: false,
        error: 'Invalid OTP code'
      };
    }
  }
  // ============================================================
  // BACKUP CODES
  // ============================================================

  /**
   * @generateBackupCodes - Generate backup recovery codes
   */
  generateBackupCodes(count = 10) {
    const codes = [];
    for (let i = 0; i < count; i++) {
      codes.push(this.HelperMethods.generateId(8, false));
    }
    return codes;
  }
  /**
   * @regenerateBackupCodes - Generate new backup codes
   */
  async regenerateBackupCodes(actorType, actorId) {
    const mfaConfig = await this.MFAConfig.findOne({
      actorType,
      actorId
    });

    if (!mfaConfig || !mfaConfig.isEnabled) {
      throw new this.ApiError('MFA not configured');
    }

    const newBackupCodes = this.generateBackupCodes();

    mfaConfig.backupCodes = await Promise.all(
      newBackupCodes.map(async code => ({
        code: await this.HelperMethods.generateBcryptHash(code),
        used: false
      }))
    );

    await mfaConfig.save();

    return {
      backupCodes: newBackupCodes
    };
  }
  // ============================================================
  // DEVICE TRUST
  // ============================================================

  /**
   * @addTrustedDevice - Add device to trusted list
   */
  async addTrustedDevice(actorType, actorId, deviceFingerprint, deviceName, expiryDays = 30) {
    const mfaConfig = await this.MFAConfig.findOne({
      actorType,
      actorId
    });

    if (!mfaConfig) {
      throw new this.ApiError('MFA config not found');
    }

    const expiresAt = new Date(Date.now() + (expiryDays * 24 * 60 * 60 * 1000));

    // Remove existing device with same fingerprint
    mfaConfig.trustedDevices = mfaConfig.trustedDevices.filter(
      device => device.fingerprint !== deviceFingerprint
    );

    // Add new trusted device
    mfaConfig.trustedDevices.push({
      fingerprint: deviceFingerprint,
      name: deviceName,
      addedAt: new Date(),
      expiresAt
    });

    await mfaConfig.save();

    return {
      success: true,
      expiresAt
    };
  }
  /**
   * @isTrustedDevice - Check if device is trusted
   */
  async isTrustedDevice(actorType, actorId, deviceFingerprint) {
    try {
      if (!deviceFingerprint) return false;

      const mfaConfig = await this.MFAConfig.findOne({
        actorType,
        actorId
      });

      if (!mfaConfig) return false;

      const trustedDevice = mfaConfig.trustedDevices.find(
        device => device.fingerprint === deviceFingerprint &&
        (!device.expiresAt || device.expiresAt > new Date())
      );

      if (trustedDevice) {
        trustedDevice.lastUsed = new Date();
        await mfaConfig.save();
        return true;
      }

      return false;

    } catch (error) {
      return false;
    }
  }
  /**
   * @removeTrustedDevice - Remove device from trusted list
   */
  async removeTrustedDevice(actorType, actorId, deviceFingerprint) {
    const mfaConfig = await this.MFAConfig.findOne({
      actorType,
      actorId
    });

    if (!mfaConfig) {
      throw new this.ApiError('MFA config not found');
    }

    mfaConfig.trustedDevices = mfaConfig.trustedDevices.filter(
      device => device.fingerprint !== deviceFingerprint
    );

    await mfaConfig.save();

    return {
      success: true
    };
  }
  /**
   * @getTrustedDevices - Get list of trusted devices
   */
  async getTrustedDevices(actorType, actorId) {
    const mfaConfig = await this.MFAConfig.findOne({
      actorType,
      actorId
    });

    if (!mfaConfig) return [];

    const activeTrustedDevices = mfaConfig.trustedDevices.filter(
      device => !device.expiresAt || device.expiresAt > new Date()
    );

    return activeTrustedDevices.map(device => ({
      fingerprint: device.fingerprint,
      name: device.name,
      addedAt: device.addedAt,
      lastUsed: device.lastUsed,
      expiresAt: device.expiresAt
    }));
  }
  // ============================================================
  // DISABLE MFA
  // ============================================================

  /**
   * @disableMFA - Disable MFA for user
   */
  async disableMFA(actorType, actorId, verificationCode) {
    // For disabling, we need to verify using the long-term MFA config
    const mfaConfig = await this.MFAConfig.findOne({
        actorType,
        actorId
      })
      .select('+totp.secret +backupCodes.code');

    if (!mfaConfig || !mfaConfig.isEnabled) {
      throw new this.ApiError('MFA is not enabled');
    }

    let verified = false;

    // Verify TOTP if applicable
    if (mfaConfig.totp && mfaConfig.totp.secret && mfaConfig.totp.isVerified) {
      const totpVerification = this.verifyTOTPCode(mfaConfig.totp.secret, verificationCode);
      if (totpVerification.valid) {
        verified = true;
      }
    }

    // Try backup codes if TOTP failed
    if (!verified && mfaConfig.backupCodes && mfaConfig.backupCodes.length > 0) {
      for (let i = 0; i < mfaConfig.backupCodes.length; i++) {
        const backupCode = mfaConfig.backupCodes[i];
        if (!backupCode.used && backupCode.code && await this.bcrypt.compare(verificationCode, backupCode.code)) {
          verified = true;
          break;
        }
      }
    }

    if (!verified) {
      throw new this.ApiError('Invalid verification code');
    }

    // Disable MFA
    mfaConfig.isEnabled = false;
    mfaConfig.method = this.MFAConfigEnum.METHODS.NONE;
    mfaConfig.totp = {};
    mfaConfig.backupCodes = [];
    mfaConfig.trustedDevices = [];
    mfaConfig.otp = {};

    await mfaConfig.save();

    return {
      success: true
    };
  }

}