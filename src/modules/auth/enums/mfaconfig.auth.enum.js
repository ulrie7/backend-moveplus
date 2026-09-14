/**
 * @MFAConfigEnum - MFA configuration enumerations and constants
 */

module.exports = {

    /**
     * MFA Methods
     */
    METHODS: {
        NONE: 'none',
        EMAIL: 'email',
        SMS: 'sms',
        WHATSAPP: 'whatsapp',
        TOTP: 'totp',
        BACKUP_CODE: 'backup_code'
    },

    /**
     * TOTP Configuration
     */
    TOTP_CONFIG: {
        DIGITS: 6,
        STEP: 30, // seconds
        ALGORITHM: 'sha1',
        WINDOW: 1 // Allow 1 time step before and after
    },

    /**
     * Recovery Configuration
     */
    RECOVERY: {
        LOCKOUT_ATTEMPTS: 5,
        LOCKOUT_DURATION: 30 * 60 * 1000, // 30 minutes in milliseconds
        CODES_REGENERATE_THRESHOLD: 3, // Suggest regeneration when 3 or fewer codes remain
        BACKUP_CODES_COUNT: 10
    },

    /**
     * MFA Status
     */
    STATUS: {
        DISABLED: 'disabled',
        ENABLED: 'enabled',
        PENDING_VERIFICATION: 'pending_verification',
        LOCKED: 'locked'
    },



};