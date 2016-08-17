'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
  History = mongoose.model('History'),
  Film = mongoose.model('Film'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  _ = require('lodash');

/**
 * Create a History
 */
exports.create = function(req, res) {
  var history = new History(req.body);
  history.user = req.user;
  if(typeof req.body.cast !== 'undefined'){
    history.searchParameters.push(req.body.cast);
  }
  if(typeof req.body.country !== 'undefined'){
    history.searchParameters.push(req.body.country);
  }
  if(typeof req.body.dateFrom !== 'undefined'){
    history.searchParameters.push(req.body.dateFrom);
  }
  if(typeof req.body.dateTo !== 'undefined'){
    history.searchParameters.push(req.body.dateTo);
  }
  if(typeof req.body.director !== 'undefined'){
    history.searchParameters.push(req.body.director);
  }
  if(typeof req.body.duration !== 'undefined'){
    history.searchParameters.push(req.body.duration);
  }
  if(typeof req.body.filmaster !== 'undefined'){
    history.searchParameters.push(req.body.filmaster);
  }
  if(typeof req.body.filmweb !== 'undefined'){
    history.searchParameters.push(req.body.filmweb);
  }
  if(typeof req.body.imdb !== 'undefined'){
    history.searchParameters.push(req.body.imdb);
  }
  if(typeof req.body.rating !== 'undefined'){
    history.searchParameters.push(req.body.rating);
  }
  if(typeof req.body.type !== 'undefined'){
    history.searchParameters.push(req.body.type);
  }
  //prepare query!


  var dbFinder = function(res) {
    var query = { $and: [], $or: []};
    var queryCountry = {$or: []};
    var queryType = {$or: []};
    if(typeof req.body.country !== 'undefined'){
      for(var i =0; i<req.body.country.length;i++){
        queryCountry.$or.push({
          country: req.body.country[i]
        });
      }
    }
    if(typeof req.body.type !== 'undefined'){
      for(var i =0; i<req.body.type.length;i++){
        queryType.$or.push({
          type: req.body.type[i]
        });
      }
    }
    if(req.body.filmweb === true){
        if(req.body.rating > 0){
          query.$or.push({
            ratingFilmweb: {$gt: req.body.rating}
          });
        }
        else{
          query.$or.push({
            ratingFilmweb: {$gt: 0}
          });
        }
      }
    if(req.body.filmaster === true){
        if(req.body.rating > 0){
          query.$or.push({
            ratingFilmaster: {$gt: req.body.rating}
          });
        }
        else {
          query.$or.push({
            ratingFilmaster: {$gt: 0}
          });
        }
      }
    if(req.body.imdb === true){
        if(req.body.rating > 0){
          query.$or.push({
            ratingImdb: {$gt: req.body.rating}
          });
        }
        else{
          query.$or.push({
            ratingImdb: {$gt: 0}
          });
        }
      }
    if(typeof req.body.dateTo !== 'undefined' && req.body.dateTo !==''){
        query.$and.push({
          release: {$lte: req.body.dateTo}
        });
      }
    else if(typeof req.body.dateTo === 'undefined' || req.body.dateTo ===''){
      var currentYear = new Date().getFullYear();
      query.$and.push({
        release: {$lte: currentYear}
      });
    }
    if(typeof req.body.dateFrom !== 'undefined' && req.body.dateFrom !==''){
      query.$and.push({
        release: {$gte: req.body.dateFrom}
      });
    }
    else if(typeof req.body.dateFrom === 'undefined' || req.body.dateFrom ===''){
      query.$and.push({
        release: {$gte: '1850'}
      });
    }
    if(queryCountry.$or.length>0){
      query.$and.push(queryCountry);
    }
    if(queryType.$or.length>0){
      query.$and.push(queryType);
    }
    if(req.body.sumarycznie === true){
      if(query.$or.length ===0){
        query.$or.push({
          ratingImdb: {$gt: 0}
        },
        {
          ratingFilmweb: {$gt: 0}
        },
        {
          ratingFilmaster: {$gt: 0}
        });
      }

      Film.find(query, function(err, data) {
        if (err) res(err, null)
        var sumCounter =0;
        var maxCounter = 0;
        var pickedElement =0;
        for(var i =0; i<data.length;i++){
          if(typeof data[i].duration !== 'undefined'){
            if(req.body.duration < data[i].duration.substring(0, data[i].duration.length -4)){
              sumCounter += 5;
            }
          }
          if(typeof req.body.cast !== 'undefined'){
            var castArray = req.body.cast.split(',');
            for(var j=0;j<castArray.length;j++){
              if(data[i].cast.indexOf(castArray[j]) > -1){
                sumCounter +=10;
              }
            }
          }
          if(typeof req.body.director !== 'undefined'){
            var castDirector = req.body.director.split(',');
            for(var k=0;k<castDirector.length;k++){
              if(data[i].director.indexOf(castDirector[k]) > -1){
                sumCounter +=10;
              }
            }
          }

          sumCounter +=parseInt(data[i].ratingFilmaster);
          sumCounter +=parseInt(data[i].ratingFilmweb);
          sumCounter +=parseInt(data[i].ratingImdb);
          if(sumCounter >maxCounter){
            maxCounter = sumCounter;
            pickedElement = i;
          }
          sumCounter = 0;
        }
          res(null, data[pickedElement]);
      });
    }
    else if(req.body.wygrane === true){
      if(query.$or.length ===0){
        if(query.$or.length ===0){
          query.$or.push({
                ratingImdb: {$gt: 0}
              },
              {
                ratingFilmweb: {$gt: 0}
              },
              {
                ratingFilmaster: {$gt: 0}
              });
        }
      }
      Film.findOne(query, function(err, data) {
        if (err) res(err, null)  ;
        res(null, data);
      }).sort({"awardsRating": -1});
    }
    else {
      if(query.$or.length ===0){
        query.$or.push({
              ratingImdb: {$gt: 0}
            },
            {
              ratingFilmweb: {$gt: 0}
            },
            {
              ratingFilmaster: {$gt: 0}
            });
      }
      Film.findOne(query, function(err,data) {
        if (err) res(err, null)  ;
        res(null, data);
      });
    }
  };
  dbFinder(function(err,filmFound) {
    if (err || filmFound ===null) {
      return res.status(400).send({
        message: 'Brak wyników, zmień kryteria wyszukiwania'
      });
    }
    else {
      if(typeof filmFound !== 'undefined'){
        history.film = filmFound._id;
        history.save(function(err) {
          if (err) {
            return res.status(400).send({
              message: errorHandler.getErrorMessage(err)
            });
          } else {
            res.jsonp(filmFound);
          }
        });
      }
    }
  });
};

/**
 * Show the current History
 */
exports.read = function(req, res) {
  // convert mongoose document to JSON
  var history = req.history ? req.history.toJSON() : {};

  // Add a custom field to the Article, for determining if the current User is the "owner".
  // NOTE: This field is NOT persisted to the database, since it doesn't exist in the Article model.
  history.isCurrentUserOwner = req.user && history.user && history.user._id.toString() === req.user._id.toString() ? true : false;

  res.jsonp(history);
};

/**
 * Update a History
 */
exports.update = function(req, res) {
  var history = req.history ;

  history = _.extend(history , req.body);

  history.save(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(history);
    }
  });
};

/**
 * Delete an History
 */
exports.delete = function(req, res) {
  var history = req.history ;

  history.remove(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(history);
    }
  });
};

/**
 * List of Histories
 */
exports.list = function(req, res) {
  History.find({user: req.user._id}).sort('-created').populate('user', 'displayName').exec(function(err, histories) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(histories);
    }
  });
};

/**
 * History middleware
 */
exports.historyByID = function(req, res, next, id) {

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'Historia niepoprawna'
    });
  }

  History.findById(id).populate('user', 'displayName').exec(function (err, history) {
    if (err) {
      return next(err);
    } else if (!history) {
      return res.status(404).send({
        message: 'Brak historii'
      });
    }
    Film.findById(history.film).populate('user', 'displayName').exec(function (err, film) {
      if (err) {
        return next(err);
      } else if (!film) {
        return res.status(404).send({
          message: 'Brak filmu dla wybranej historii'
        });
      }
      req.history = film;
      req.searchParameters = history;
      next();
    });
  });
};
