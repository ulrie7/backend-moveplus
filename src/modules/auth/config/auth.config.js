/**
 * @AuthConfig - Centralized authentication configuration
 * Single source of truth for actor configurations and security settings
 */

const AuthEnum = require("../enums/auth.enum");
const AuthIdentityEnum = require("../enums/identity.auth.enum");
const MessageDispatcher = require("../../../shared/lib/message_dispatcher")

module.exports = class AuthConfig {

    /**
     * Get actor-specific configuration
     * Reads actor types from AuthEnum to avoid duplication
     */
    static getActorConfig(actorType) {
        const actorKey = actorType.toUpperCase();
        const actorInfo = AuthEnum.ACTOR_TYPES[actorKey];

        if (!actorInfo) {
            return null;
        }

        // Base configuration for all actors
        const baseConfig = {
            requiresMFA: actorInfo.REQUIRES_MFA,
            accessTokenExpiry: 24 * 60 * 60 * 1000, // 24 hours
            refreshTokenExpiry: 30 * 24 * 60 * 60 * 1000, // 30 days
            sessionSettings: {
                maxActiveSessions: 5,
                sessionTimeout: 24 * 60 * 60 * 1000, // 24 hours
                allowConcurrentSessions: true
            },
            passwordPolicy: {
                minLength: 8,
                requireUppercase: true,
                requireLowercase: true,
                requireNumbers: true,
                requireSpecialChars: false,
                preventCommonPasswords: true,
                preventReuse: 5,
                maxAge: 90 * 24 * 60 * 60 * 1000, // 90 days
                minEntropy: 50
            }
        };

        // Actor-specific overrides
        const actorOverrides = {
            // SUPER_ADMIN: {
            //     accessTokenExpiry: 12 * 60 * 60 * 1000, // 12 hours (more secure)
            //     passwordPolicy: {
            //         minLength: 12,
            //         requireSpecialChars: true,
            //         minEntropy: 60
            //     }
            // },

        };

        // Merge base config with actor-specific overrides
        const override = actorOverrides[actorKey];
        if (override) {
            return this._deepMerge(baseConfig, override);
        }

        return baseConfig;
    }

    /**
     * Get security configuration
     */
    static getSecurityConfig() {
        return {
            tokens: {
                algorithm: 'HS256',
                issuer: process.env.JWT_ISSUER || 'YourApp',
                audience: process.env.JWT_AUDIENCE || 'YourApp-Users',
                refreshTokenRotation: process.env.REFRESH_TOKEN_ROTATION === 'true'
            },

            rateLimit: {
                login: {
                    maxAttempts: 5,
                    windowMs: 15 * 60 * 1000,
                    lockoutDuration: 30 * 60 * 1000
                },
                mfa: {
                    maxAttempts: 5,
                    windowMs: 15 * 60 * 1000,
                    lockoutDuration: 30 * 60 * 1000
                },
                passwordReset: {
                    maxAttempts: 3,
                    windowMs: 60 * 60 * 1000,
                    lockoutDuration: 24 * 60 * 60 * 1000,
                    maxRequestsPerDay: 5,
                    codeLength: 4,
                    codeExpiry: 20 * 60 * 1000 // 20 minutes
                },
                tokenRefresh: {
                    maxAttempts: 10,
                    windowMs: 15 * 60 * 1000,
                    lockoutDuration: 30 * 60 * 1000
                },
                otpResend: {
                    maxAttempts: 3,
                    windowMs: 15 * 60 * 1000,
                    minDelay: 60 * 1000
                }
            },

            identifierVerification: {
                codeExpiry: 20 * 60 * 1000,
                maxAttempts: 5,
                resendDelay: 60 * 1000,
                codeLength: 5
            },


            accountLockout: {
                maxFailedAttempts: 5,
                lockoutDuration: 30 * 60 * 1000,
                escalationThreshold: 10,
                escalationMultiplier: 2,
                permanentLockThreshold: 20
            },

            sessionManagement: {
                inactivityTimeout: 30 * 60 * 1000,
                autoCleanupEnabled: true
            },

            riskAnalysis: {
                enabled: true,
                factors: {
                    newDevice: 10,
                    newLocation: 15,
                    suspiciousIP: 20,
                    unusualTime: 5,
                    velocityAnomaly: 15,
                    impossibleTravel: 25,
                    knownBotSignature: 30,
                    multipleFailedAttempts: 10
                },
                thresholds: {
                    low: 0,
                    medium: 20,
                    high: 40,
                    critical: 60
                },
                actions: {
                    medium: ['require_mfa'],
                    high: ['require_mfa', 'notify_user', 'log_detailed'],
                    critical: ['block_attempt', 'notify_admin', 'trigger_investigation']
                }
            },

            notifications: {
                newDevice: true,
                passwordChange: true,
                mfaChange: true,
                suspiciousActivity: true,
                passwordExpiringSoon: true,
                unusualLogin: true
            },

            oauth: {
                google: {
                    enabled: process.env.GOOGLE_OAUTH_ENABLED === 'true',
                    clientId: process.env.GOOGLE_CLIENT_ID,
                    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
                    redirectUri: process.env.GOOGLE_REDIRECT_URI
                }
            }
        };
    }

    /**
     * Get OTP configuration
     */
    static getOTPConfig() {
        return {
            codeLength: 4,
            codeExpiry: 15 * 60 * 1000,
            maxAttempts: 3,
            resendDelay: 60 * 1000,
            maxResendPerSession: 3,
            channels: {
                email: {
                    enabled: true,
                    template: 'OTP_LOGIN'
                },
                sms: {
                    enabled: process.env.SMS_OTP_ENABLED === 'true',
                    template: 'OTP_LOGIN'
                },
                whatsapp: {
                    enabled: process.env.WHATSAPP_OTP_ENABLED === 'true',
                    template: 'OTP_LOGIN'
                }
            }
        };
    }

    /**
     * Get MFA configuration
     */
    static getMFAConfig() {
        return {
            methods: {
                email: {
                    enabled: true,
                    codeLength: 6,
                    codeExpiry: 15 * 60 * 1000
                },
                sms: {
                    enabled: process.env.SMS_MFA_ENABLED === 'true',
                    codeLength: 6,
                    codeExpiry: 15 * 60 * 1000
                },
                whatsapp: {
                    enabled: process.env.WHATSAPP_MFA_ENABLED === 'true',
                    codeLength: 6,
                    codeExpiry: 15 * 60 * 1000
                },
                totp: {
                    enabled: true,
                    digits: 6,
                    step: 30,
                    window: 1
                }
            },
            backupCodes: {
                count: 10,
                length: 8,
                regenerateThreshold: 3,
                autoRegenerateEnabled: false
            },
            deviceTrust: {
                enabled: true,
                expiryDays: 30,
                maxDevices: 10,
                autoRemoveExpired: true
            },
            resend: {
                maxAttempts: 3,
                windowMs: 15 * 60 * 1000,
                minDelay: 60 * 1000
            }
        };
    }

    /**
     * Validate password against policy
     */
    static validatePassword(password, actorType) {
        const actorConfig = this.getActorConfig(actorType);
        if (!actorConfig) {
            throw new Error(`Invalid actor type: ${actorType}`);
        }

        const policy = actorConfig.passwordPolicy;
        const errors = [];

        if (password.length < policy.minLength) {
            errors.push(`Password must be at least ${policy.minLength} characters long`);
        }

        if (policy.requireUppercase && !/[A-Z]/.test(password)) {
            errors.push('Password must contain at least one uppercase letter');
        }

        if (policy.requireLowercase && !/[a-z]/.test(password)) {
            errors.push('Password must contain at least one lowercase letter');
        }

        if (policy.requireNumbers && !/\d/.test(password)) {
            errors.push('Password must contain at least one number');
        }

        if (policy.requireSpecialChars && !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
            errors.push('Password must contain at least one special character');
        }

        if (policy.preventCommonPasswords) {
            const commonPasswords = this.getCommonPasswordsList();
            if (commonPasswords.includes(password.toLowerCase())) {
                errors.push('Password is too common. Please choose a stronger password');
            }
        }

        if (policy.minEntropy) {
            const entropy = this.calculatePasswordEntropy(password);
            if (entropy < policy.minEntropy) {
                errors.push(`Password is not complex enough (entropy: ${entropy.toFixed(1)} bits, required: ${policy.minEntropy} bits)`);
            }
        }

        return {
            valid: errors.length === 0,
            errors,
            entropy: this.calculatePasswordEntropy(password)
        };
    }

    /**
     * Resolve the messaging channel based on the authentication identifier type.
     *
     * @param {string} identifierType - One of AuthIdentityEnum.IDENTIFIER_TYPES.*.KEY
     * @returns {string} - The resolved messaging channel (email, sms, whatsapp)
     * @throws {Error} - If the identifier type is not supported
     */
    static resolveDefaultChannelFromIdentifier(identifierType) {
        switch (identifierType) {
            case AuthIdentityEnum.IDENTIFIER_TYPES.EMAIL.KEY:
                return MessageDispatcher.CHANNELS.EMAIL

            case AuthIdentityEnum.IDENTIFIER_TYPES.PHONE.KEY:
                return MessageDispatcher.CHANNELS.SMS

            default:
                throw new Error(`Unsupported identifier type: ${identifierType}`)
        }
    }

    /**
     * Calculate password entropy
     */
    static calculatePasswordEntropy(password) {
        let charsetSize = 0;

        if (/[a-z]/.test(password)) charsetSize += 26;
        if (/[A-Z]/.test(password)) charsetSize += 26;
        if (/\d/.test(password)) charsetSize += 10;
        if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) charsetSize += 32;

        return password.length * Math.log2(charsetSize);
    }

    /**
     * Get common passwords list
     */
    static getCommonPasswordsList() {
        return [
            'password', 'password123', '123456', '12345678', 'qwerty',
            'abc123', 'monkey', '1234567', 'letmein', 'trustno1',
            '111111', 'dragon', 'master', 'sunshine', 'princess',
            'football', 'shadow', 'superman', 'welcome', 'admin',
            'login', 'passw0rd', 'password1', '123456789', '12345'
        ];
    }

    /**
     * Check if lockout should be escalated
     */
    static shouldEscalateLockout(failedAttempts) {
        const config = this.getSecurityConfig().accountLockout;
        return failedAttempts >= config.escalationThreshold;
    }

    /**
     * Calculate lockout duration with escalation
     */
    static calculateLockoutDuration(failedAttempts) {
        const config = this.getSecurityConfig().accountLockout;

        if (failedAttempts >= config.permanentLockThreshold) {
            return -1; // Permanent lock
        }

        if (failedAttempts >= config.escalationThreshold) {
            const escalationLevel = Math.floor(failedAttempts / config.escalationThreshold);
            return config.lockoutDuration * Math.pow(config.escalationMultiplier, escalationLevel);
        }

        return config.lockoutDuration;
    }

    /**
     * Get risk level actions
     */
    static getRiskActions(riskLevel) {
        const config = this.getSecurityConfig().riskAnalysis;
        return config.actions[riskLevel] || [];
    }

    /**
     * Check if notification should be sent
     */
    static shouldNotify(eventType) {
        const config = this.getSecurityConfig().notifications;
        return config[eventType] || false;
    }

    /**
     * Get all available actor types
     */
    static getAvailableActorTypes() {
        return Object.keys(AuthEnum.ACTOR_TYPES).map(key => {
            const actor = AuthEnum.ACTOR_TYPES[key];
            return {
                key: actor.NAME,
                label: actor.LABEL || actor.NAME,
                requiresMFA: actor.REQUIRES_MFA
            };
        });
    }

    /**
     * Deep merge utility for nested objects
     * @private
     */
    static _deepMerge(target, source) {
        const result = {...target };

        for (const key in source) {
            if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
                result[key] = this._deepMerge(result[key] || {}, source[key]);
            } else {
                result[key] = source[key];
            }
        }

        return result;
    }
};