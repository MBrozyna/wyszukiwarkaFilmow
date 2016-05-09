'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

/**
 * Film Schema
 */
var FilmSchema = new Schema({
  title : {
    type: String,
    default: ''
  },
  release : {
    type: String,
    default: ''
  },
  rating : {
    type: Number,
    default: 0
  },
  type: {
    type: Array,
    default: []
  },
  duration: {
    type: String,
    default: ''
  },
  nominations: {
    type: Number,
    default:0
  },
  won: {
    type: Number,
    default: 0
  },
  awardsRating: {
    type: Number,
    default: 0
  },
  baseSite: {
    type: String,
    default: ''
  },
  cast: {
    type: Array,
    default: []
  },
  country: {
    type: Array,
    default: []
  },
  description: {
    type: String,
    default: ''
  },
  director: {
    type: Array,
    default:[]
  }
});

mongoose.model('Film', FilmSchema);
