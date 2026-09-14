const mongoose = require("mongoose");
const uniqueValidator = require('mongoose-unique-validator');
const slug = require('mongoose-slug-updater');
const softDeletePlugin = require('../../../shared/plugins/softDeletePlugin');
const AuthEnum = require("../enums/auth.enum");
const helperMethod = new(require("../../../shared/utils/helper.utils"))();

const Schema = new mongoose.Schema({

  eventType: {
    type: String,
    required: false,
    enum: Object.values(AuthEnum.AUTH_EVENTS),
  },

  eventId: {
    type: String,
    required: false,
    unique: true,
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

  sessionId: {
    type: String,
    required: false,
    ref: "AuthSession"
  },

  ipAddress: {
    type: String,
    required: false,
  },

  userAgent: {
    type: String,
    required: false,
    maxlength: 500,
  },

  device: {
    type: {
      type: String,
      enum: Object.values(AuthEnum.DEVICE_TYPES),
      default: AuthEnum.DEVICE_TYPES.UNKNOWN
    },
    fingerprint: {
      type: String,
      maxlength: 255
    }
  },

  location: {
    country: String,
    city: String,
    timezone: String,
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },

  success: {
    type: Boolean,
    required: false,
  },

  errorCode: {
    type: String,
    required: false,
  },

  errorMessage: {
    type: String,
    required: false,
    maxlength: 500,
  },

  riskLevel: {
    type: String,
    required: false,
    default: AuthEnum.SECURITY_LEVELS.LOW,
    enum: Object.values(AuthEnum.SECURITY_LEVELS),
  },

  riskFactors: [{
    type: {
      type: String,
      enum: ['unusual_location', 'unusual_time', 'multiple_failures', 'new_device', 'suspicious_ip', 'velocity_check', 'blacklisted_ip', 'tor_exit_node']
    },
    score: {
      type: Number,
      min: 0,
      max: 100
    },
    description: String
  }],

  totalRiskScore: {
    type: Number,
    required: false,
    default: 0,
    min: 0,
    max: 1000,
  },

  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },

  actionTaken: {
    type: String,
    required: false,
    default: 'none',
    enum: ['none', 'mfa_required', 'account_locked', 'session_revoked', 'ip_blocked', 'admin_notified', 'security_review'],
  },

  correlatedEvents: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AuthSecurityAudit'
  }],

  processed: {
    type: Boolean,
    required: false,
    default: false,
  },

  processedAt: {
    type: Date,
    required: false,
  },

  retentionDate: {
    type: Date,
    default: function() {
      // Default retention: 2 years
      return new Date(Date.now() + 2 * 365 * 24 * 60 * 60 * 1000);
    }
  },
}, {
  timestamps: true
});

// Indexes for performance and querying
Schema.index({
  eventType: 1,
  createdAt: -1
});
Schema.index({
  userId: 1,
  createdAt: -1
});
Schema.index({
  sessionId: 1
});
Schema.index({
  ipAddress: 1,
  createdAt: -1
});
Schema.index({
  success: 1,
  riskLevel: 1
});
Schema.index({
  retentionDate: 1
});
Schema.index({
  'device.fingerprint': 1
});
Schema.index({
  totalRiskScore: -1
});
Schema.index({
  processed: 1,
  actionTaken: 1
});

// Compound indexes for common queries
Schema.index({
  userId: 1,
  eventType: 1,
  createdAt: -1
});
Schema.index({
  actorType: 1,
  success: 1,
  createdAt: -1
});

const dateFields = ['createdAt', 'updatedAt', 'deletedAt', 'processedAt', 'retentionDate'];
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

// Static methods
Schema.statics.createAuditLog = function(eventData) {
  const auditLog = new this({
    eventId: helperMethod.generateId(16),
    ...eventData,
    createdAt: new Date()
  });

  return auditLog.save();
};

Schema.statics.getSecuritySummary = function(userId, days = 30) {
  const startDate = new Date(Date.now() - (days * 24 * 60 * 60 * 1000));

  return this.aggregate([{
      $match: {
        userId: mongoose.Types.ObjectId(userId),
        createdAt: {
          $gte: startDate
        }
      }
    },
    {
      $group: {
        _id: {
          eventType: '$eventType',
          success: '$success'
        },
        count: {
          $sum: 1
        },
        avgRiskScore: {
          $avg: '$totalRiskScore'
        },
        maxRiskScore: {
          $max: '$totalRiskScore'
        },
        lastOccurrence: {
          $max: '$createdAt'
        }
      }
    }
  ]);
};

// Instance methods
Schema.methods.addRiskFactor = function(type, score, description) {
  this.riskFactors.push({
    type,
    score,
    description
  });
  this.totalRiskScore = this.riskFactors.reduce((total, factor) => total + factor.score, 0);
  return this.save();
};

Schema.methods.markProcessed = function(actionTaken = 'none') {
  this.processed = true;
  this.processedAt = new Date();
  this.actionTaken = actionTaken;
  return this.save();
};

module.exports = mongoose.model("AuthSecurityAudit", Schema);