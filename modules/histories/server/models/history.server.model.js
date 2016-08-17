'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

/**
 * History Schema
 */
var HistorySchema = new Schema({
  created: {
    type: Date,
    default: Date.now
  },
    user: {
      type: Schema.ObjectId,
      ref: 'User'
    },
    film: {
      type: Schema.ObjectId,
      ref: 'Film'
  },
  searchParameters: {
    type: Array,
    default:[]
  }
});

mongoose.model('History', HistorySchema);
