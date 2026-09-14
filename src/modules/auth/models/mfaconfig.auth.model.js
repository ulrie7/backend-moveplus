const mongoose = require("mongoose");
const uniqueValidator = require('mongoose-unique-validator');
const slug = require('mongoose-slug-updater');
const softDeletePlugin = require('../../../shared/plugins/softDeletePlugin');
const MfaConfigEnum = require("../enums/mfaconfig.auth.enum");
const helperMethod = new(require("../../../shared/utils/helper.utils"))();
const AuthEnum = require("../enums/auth.enum");


const Schema = new mongoose.Schema({

  method: {
    type: String,
    required: false,
    default: MfaConfigEnum.METHODS.NONE,
    enum: Object.values(MfaConfigEnum.METHODS),
  },

  actorType: {
    type: String,
    required: false,
  },

  actorId: {
    type: mongoose.Schema.Types.ObjectId,
    required: false,
  },

  isEnabled: {
    type: Boolean,
    required: false,
    default: false,
  },

  phoneNumber: {
    type: String,
    required: false,
  },

  emailAddress: {
    type: String,
    required: false,
  },

  totp: {
    secret: {
      type: String,
      select: false // Never include in queries by default
    },
    qrCode: {
      type: String,
      select: false
    },
    isVerified: {
      type: Boolean,
      default: false
    },
    lastUsed: {
      type: Date
    },
    failedAttempts: {
      type: Number,
      default: 0
    }
  },

  otp: {
    code: {
      type: String,
      required: false,
      select: false
    },
    identifier: {
      type: String,
      required: false,
      select: false
    },
    expiresAt: {
      type: Date,
      required: false
    },
    channel: {
      type: String,
      enum: [...Object.values(AuthEnum.MESSAGE_CHANNELS), null],
      default: null
    },
    isCodeSent: {
      type: Boolean,
      required: false
    },
    codeVerifiedAt: {
      type: Date,
      required: false
    },
    attempts: {
      type: Number,
      required: false,
      default: 0
    },
    lastAttemptAt: {
      type: Date,
      required: false
    }
  },

  backupCodes: [{
    code: {
      type: String,
      select: false
    },
    used: {
      type: Boolean,
      default: false
    },
    usedAt: {
      type: Date
    }
  }],

  recovery: {
    isLocked: {
      type: Boolean,
      default: false
    },
    lockedAt: {
      type: Date
    },
    lockReason: {
      type: String
    },
    lastFailedAttempt: {
      type: Date
    },
    failedAttempts: {
      type: Number,
      default: 0
    }
  },

  trustedDevices: [{
    fingerprint: String,
    name: String,
    addedAt: {
      type: Date,
      default: Date.now
    },
    lastUsed: Date,
    expiresAt: Date
  }],

  notifications: {
    onLogin: {
      type: Boolean,
      default: true
    },
    onMfaChange: {
      type: Boolean,
      default: true
    },
    onSuspiciousActivity: {
      type: Boolean,
      default: true
    }
  },
}, {
  timestamps: true
});

const dateFields = ['createdAt', 'updatedAt', 'deletedAt'];

Schema.plugin(slug);
Schema.plugin(uniqueValidator, {
  message: '{PATH} already exists.'
});
Schema.plugin(softDeletePlugin);

Schema.post("find", async function(docs, next) {
  if (docs && Array.isArray(docs)) {
    for (const item of docs) {
      if (item) {
        helperMethod.dateFieldsFormatAlgo(item, dateFields); // Added await
      }
    }
  }
  if (typeof next === 'function') {
    next();
  }
});

Schema.post("findOne", async function(doc, next) {
  if (doc) {
    helperMethod.dateFieldsFormatAlgo(doc, dateFields);
  }
  if (typeof next === 'function') {
    next();
  }
});


module.exports = mongoose.model("MFAConfig", Schema);