const mongoose = require("mongoose");
const uniqueValidator = require('mongoose-unique-validator');
const slug = require('mongoose-slug-updater');
const softDeletePlugin = require('../../../shared/plugins/softDeletePlugin');
const AuthIdentitySecurityEnum = require("../enums/identity.security.auth.enum");
const helperMethod = new(require("../../../shared/utils/helper.utils"))();


const Schema = new mongoose.Schema({

  identity: {
    type: mongoose.Schema.Types.ObjectId,
    required: false,
    unique: true,
    ref: "AuthIdentity"
  },

  password: {
    type: String,
    required: false,
    select: false,
    _isHashed: true,
  },

  identifierVerification: {
    code: {
      type: String,
      required: false,
      select: false
    },
    expiredOn: {
      type: Date,
      required: false
    },
    verifiedOn: {
      type: Date,
      required: false
    },
    contactId: {
      type: String,
      required: false
    },
    lastAttemptAt: {
      type: Date,
      required: false
    },
    attempts: {
      type: Number,
      required: false
    }
  },

  passwordReset: {
    code: {
      type: String,
      required: false,
      select: false
    },
    expiredOn: {
      type: Date,
      required: false
    },
    verifiedOn: {
      type: Date,
      required: false
    },
    contactId: {
      type: String,
      required: false
    },
    lastAttemptAt: {
      type: Date,
      required: false
    },
    attempts: {
      type: Number,
      required: false
    }
  },

  oauth: {
    provider: {
      type: String,
      required: false,
      enum: Object.values(AuthIdentitySecurityEnum.OAUTH_PROVIDERS).map(item => item.PROVIDER)
    },
    id: {
      type: String,
      required: false
    }
  },

  lastLogin: {
    type: Date,
    required: false,
    _isExcludedFromInput: true,
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


module.exports = mongoose.model("AuthIdentitySecurity", Schema);