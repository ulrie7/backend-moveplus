const mongoose = require("mongoose");
const uniqueValidator = require('mongoose-unique-validator');
const slug = require('mongoose-slug-updater');
const softDeletePlugin = require('../../../shared/plugins/softDeletePlugin');
const AuthEnum = require("../enums/auth.enum");
const MfaConfigEnum = require("../enums/mfaconfig.auth.enum");
const helperMethod = new(require("../../../shared/utils/helper.utils"))();

const Schema = new mongoose.Schema({

  sessionId: {
    type: String,
    required: false,
    unique: true,
    _isExcludedFromInput: true,
  },

  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: false,
    ref: "AuthIdentity"
  },

  actorType: {
    type: String,
    required: false,
    enum: Object.values(AuthEnum.ACTOR_TYPES).map(item => item.NAME),
  },

  accessToken: {
    type: String,
    required: false,
    _isExcludedFromInput: true,
  },

  refreshToken: {
    type: String,
    required: false,
    _isExcludedFromInput: true,
  },

  accessTokenExpiresAt: {
    type: Date,
    required: false,
  },

  refreshTokenExpiresAt: {
    type: Date,
    required: false,
  },

  device: {
    type: {
      type: String,
      enum: Object.values(AuthEnum.DEVICE_TYPES),
      default: AuthEnum.DEVICE_TYPES.WEB
    },
    name: {
      type: String,
      maxlength: 100,
      default: "Unknown Device"
    },
    fingerprint: {
      type: String,
      maxlength: 255,
      select: false
    },
    userAgent: {
      type: String,
      maxlength: 500
    },
    isTrusted: {
      type: Boolean,
      default: false
    }
  },

  mfa: {
    isEnabled: {
      type: Boolean,
      default: false
    },
    code: {
      type: String,
      required: false,
      select: false
    },
    contactId: {
      type: String,
      required: false,
      select: false
    },
    codeExpiresAt: {
      type: Date,
      required: false
    },
    method: {
      type: String,
      enum: Object.values(MfaConfigEnum.METHODS),
      default: MfaConfigEnum.METHODS.NONE
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

  ipAddress: {
    type: String,
    required: false,
  },

  location: {
    country: String,
    city: String,
    timezone: String
  },

  status: {
    type: String,
    required: false,
    default: AuthEnum.SESSION_STATUS.ACTIVE,
    enum: Object.values(AuthEnum.SESSION_STATUS),
  },

  lastActivityAt: {
    type: Date,
    required: false,
    default: Date.now,
  },

  mfaVerified: {
    type: Boolean,
    required: false,
    default: false,
  },

  securityLevel: {
    type: String,
    required: false,
    default: AuthEnum.SECURITY_LEVELS.MEDIUM,
    enum: Object.values(AuthEnum.SECURITY_LEVELS),
  },

  isBackground: {
    type: Boolean,
    required: false,
    default: false,
  },

  revokedAt: {
    type: Date,
    required: false,
  },

  revokedBy: {
    type: String,
    required: false,
  },

  revokedReason: {
    type: String,
    required: false,
    maxlength: 255,
  },
}, {
  timestamps: true
});

// Indexes for performance
Schema.index({
  userId: 1,
  status: 1
});
Schema.index({
  accessToken: 1
});
Schema.index({
  refreshToken: 1
});
Schema.index({
  sessionId: 1
});
Schema.index({
  'device.fingerprint': 1
});
Schema.index({
  lastActivityAt: 1
});
Schema.index({
  accessTokenExpiresAt: 1
});

// Virtual for checking if session is expired
Schema.virtual('isExpired').get(function() {
  return Date.now() > this.accessTokenExpiresAt.getTime();
});

// Virtual for checking if refresh token is expired
Schema.virtual('isRefreshExpired').get(function() {
  return Date.now() > this.refreshTokenExpiresAt.getTime();
});

// Virtual for session duration
Schema.virtual('duration').get(function() {
  return this.lastActivityAt - this.createdAt;
});

const dateFields = []
Schema.plugin(slug);
Schema.plugin(uniqueValidator, {
  message: '{PATH} already exists.'
});
Schema.plugin(softDeletePlugin);

Schema.post("find", async function(docs, next) {
  if (docs && Array.isArray(docs)) {
    for (const item of docs) {
      if (item) {
        helperMethod.dateFieldsFormatAlgo(item, dateFields);
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

// Methods
Schema.methods.updateActivity = function() {
  this.lastActivityAt = new Date();
  return this.save();
};

Schema.methods.revoke = function(revokedBy = 'user', reason = 'Manual logout') {
  this.status = AuthEnum.SESSION_STATUS.REVOKED;
  this.revokedAt = new Date();
  this.revokedBy = revokedBy;
  this.revokedReason = reason;
  return this.save();
};

Schema.methods.markSuspicious = function(reason) {
  this.status = AuthEnum.SESSION_STATUS.SUSPICIOUS;
  this.securityLevel = AuthEnum.SECURITY_LEVELS.HIGH;
  this.revokedReason = reason;
  return this.save();
};

module.exports = mongoose.model("AuthSession", Schema);