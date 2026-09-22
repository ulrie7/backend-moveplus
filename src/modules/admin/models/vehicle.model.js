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
  

  name: {
    type: String,
    required: false,
  },

  imei: {
    type: Number,
    required: true,
  },

  immatriculation: {
    type: String,
    required: false,
  },

  type_vehicule: {
    type: String,
    required: false,
  },

  brand: {
    type: String,
    required: false,
  },

  modele: {
    type: String,
    required: false,
  },

  color: {
    type: String,
    required: false,
  },

  year: {
    type: String,
    required: false,
  },

  status: {
    type: String,
    required: false,
  },

  gps_id: {
    type: mongoose.Schema.Types.ObjectId,
    required: false,
    ref: "GPS"
  },

  coordinates: {
    lat: {
      type: Number,
      required: false,
    },
    lng: {
      type: Number,
      required: false,
    },
  },

  image: {
    type: String,
    required: false,
    _isFileReference: true,
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


module.exports = mongoose.models.Vehicle || mongoose.model("Vehicle", Schema);
