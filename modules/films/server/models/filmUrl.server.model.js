'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

/**
 * FilmUrl Schema
 */
var FilmUrlSchema = new Schema({
  title : {
    type: Array,
    default: []
  },
  baseSite : {
    type: String,
    default: ''
  }
});

mongoose.model('FilmUrl', FilmUrlSchema);
