const mongoose = require("mongoose");
const uniqueValidator = require('mongoose-unique-validator');
const slug = require('mongoose-slug-generator');
const softDeletePlugin = require('../../../shared/plugins/softDeletePlugin');
const AuthEnum = require("../enums/auth.enum");
const MfaConfigEnum = require("../enums/mfaconfig.auth.enum");
const helperMethod = new(require("../../../shared/utils/helper.utils"))();


const Schema = new mongoose.Schema({

  actorType: {
    type: String,
    required: false,
    _isExcludedFromInput: true,
    enum: Object.values(AuthEnum.ACTOR_TYPES).map(item => item.NAME),
  },

  accessToken: {
    type: String,
    required: false,
    _isExcludedFromInput: true,
  },

  accessTokenExpiresAt: {
    type: Date,
    required: false,
    _isExcludedFromInput: true,
  },

  refreshToken: {
    type: String,
    required: false,
    _isExcludedFromInput: true,
  },

  refreshTokenExpiresAt: {
    type: Date,
    required: false,
    _isExcludedFromInput: true,
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
    codeExpiresAt: {
      type: Date,
      required: false
    },
    method: {
      type: String,
      enum: [MfaConfigEnum.METHODS.EMAIL, MfaConfigEnum.METHODS.SMS, MfaConfigEnum.METHODS.NONE],
      default: MfaConfigEnum.METHODS.NONE
    },
    contactId: {
      type: String,
      required: false,
      select: false
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


module.exports = mongoose.model("Auth", Schema);