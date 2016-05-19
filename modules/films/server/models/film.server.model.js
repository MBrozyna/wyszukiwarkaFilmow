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
  originalTitle : {
    type: String,
    default: ''
  },
  release : {
    type: String,
    default: ''
  },
  ratingFilmweb : {
    type: String,
    default: 0
  },
  ratingImdb : {
    type: String,
    default: 0
  },
  ratingFilmaster : {
    type: String,
    default: 0
  },
  img : {
    type: String,
    default: ''
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
