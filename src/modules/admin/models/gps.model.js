const mongoose = require("mongoose");
const uniqueValidator = require('mongoose-unique-validator');
const slug = require('mongoose-slug-updater');
const softDeletePlugin = require('../../../shared/plugins/softDeletePlugin');
const helperMethod = new(require("../../../shared/utils/helper.utils"))();


const Schema = new mongoose.Schema({

  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    required: false,
  },

  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    required: false,
  },

  deletedBy: {
    type: mongoose.Schema.Types.ObjectId,
    required: false,
  },

  imei: {
    type: String,
    required: false,
  },

  status: {
    type: String,
    required: false,
  },

  battery: {
    type: Number,
    required: false,
  },

  brand: {
    type: String,
    required: false,
  },

  last_connexion: {
    type: Date,
    required: false,
  },

  model_device: {
    type: String,
    required: false,
  },

  vehicle_id: {
    type: mongoose.Schema.Types.ObjectId,
    required: false,
    ref: "Vehicle"
  },
}, {
  timestamps: true
});

const dateFields = [];

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


module.exports = mongoose.model("GPS", Schema);