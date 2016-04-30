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
  link : {
    type: Array,
    default: []
  }
});

mongoose.model('FilmUrl', FilmUrlSchema);
