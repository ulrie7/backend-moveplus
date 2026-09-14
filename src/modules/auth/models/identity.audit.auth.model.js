const mongoose = require("mongoose");
const uniqueValidator = require('mongoose-unique-validator');
const slug = require('mongoose-slug-updater');
const softDeletePlugin = require('../../../shared/plugins/softDeletePlugin');
const IdentityAuditAuthEnum = require("../enums/identity.audit.auth.enum");
const helperMethod = new(require("../../../shared/utils/helper.utils"))();


const Schema = new mongoose.Schema({

  identity: {
    type: mongoose.Schema.Types.ObjectId,
    required: false,
    _isExcludedFromInput: true,
    ref: "AuthIdentity"
  },

  action: {
    type: String,
    required: false,
    _isExcludedFromInput: true,
    enum: Object.values(IdentityAuditAuthEnum.ACTIONS).map(item => item.KEY),
  },

  performBy: {
    type: mongoose.Schema.Types.ObjectId,
    required: false,
    _isExcludedFromInput: true,
    ref: "AuthIdentity"
  },

  details: {
    type: mongoose.Schema.Types.Mixed,
    required: false,
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


module.exports = mongoose.model("AuthIdentityAudit", Schema);