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

  date_start: {
    type: Date,
    required: false,
  },

  date_end: {
    type: Date,
    required: false,
  },

  stop_time: {
    type: Number,
    required: false,
  },

  stop_nb: {
    type: Number,
    required: false,
  },

  status: {
    type: String,
    required: false,
  },

  vehicle_id: {
    type: mongoose.Schema.Types.ObjectId,
    required: false,
    ref: "Vehicle"
  },

  distance: {
    type: Number,
    required: false,
  },

  average_speed: {
    type: Number,
    required: false,
  },

  max_speed: {
    type: Number,
    required: false,
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


module.exports = mongoose.model("Trajet", Schema);