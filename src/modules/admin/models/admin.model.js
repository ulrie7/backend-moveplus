const mongoose = require("mongoose");
const uniqueValidator = require('mongoose-unique-validator');
const slug = require('mongoose-slug-updater');
const softDeletePlugin = require('../../../shared/plugins/softDeletePlugin');
const AdminEnum = require("../enums/admin.enum")
const helperMethod = new(require("../../../shared/utils/helper.utils"))();


const Schema = new mongoose.Schema({

  firstName: {
    type: String,
    required: false,
  },

  lastName: {
    type: String,
    required: false,
  },

  email: {
    type: String,
    required: false,
    unique: true,
    lowercase: true,
  },

  identity: {
    type: mongoose.Schema.Types.ObjectId,
    required: false,
    unique: true,
    _isExcludedFromInput: true,
    ref: "AuthIdentity"
  },

  roles: [{
    type: String,
    enum: Object.values(AdminEnum.ROLES).map(item => item.KEY),
    required: true
  }],

  isActive: {
    type: Boolean,
    required: false,
    _isExcludedFromInput: true,
    default: false,
  },

  isBlocked: {
    type: Boolean,
    required: false,
    _isExcludedFromInput: true,
    default: false,
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



module.exports = mongoose.model("Admin", Schema);