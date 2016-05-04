'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
/*
  sitemap = require('sitemap'),
*/
  cheerio = require('cheerio'),
  fs = require('fs'),
  request = require('request'),
  Film = mongoose.model('Film'),
  FilmUrl = mongoose.model('FilmUrl'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  _ = require('lodash'),
  siteMapFinderImdbFlag = false;

/**
 * Create a FilmUrl
 */

function siteMapFinderImdb(){
  var filmUrlList = [];
  var requestFirst =false;
  var imdbUrl1_250 = 'http://www.imdb.com/list/ls004427773/?start=1&view=compact&sort=user_rating:desc';
  var imdbUrl250_500 = 'http://www.imdb.com/list/ls004427773/?start=251&view=compact&sort=user_rating:desc';
  request(imdbUrl1_250, function (error, response, html) {
    if (!error && response.statusCode === 200) {
      var $ = cheerio.load(html);
      $('.title').filter(function () {
        var filmUrl = new FilmUrl();
        if(typeof $(this).children().attr('href') !== 'undefined') {
          filmUrl.link = 'http://www.imdb.com' + $(this).children().attr('href');
          filmUrlList.push(filmUrl);
        }
      });
    }
    requestFirst=true;
  });
  request(imdbUrl250_500, function (error, response, html) {
    if (!error && response.statusCode === 200) {
      var $ = cheerio.load(html);
      $('.title').filter(function () {
        var filmUrl = new FilmUrl();
        if(typeof $(this).children().attr('href') !== 'undefined'){
          filmUrl.link = 'http://www.imdb.com' + $(this).children().attr('href');
          filmUrlList.push(filmUrl);
        }
      });
    }
    console.log('Rozmiar: ' + filmUrlList.length);
    siteMapFinderImdbFlag = true;
  });
  while(filmUrlList.length !== 500){require('deasync').sleep(100);}
  console.log(filmUrlList.length);
  return filmUrlList;
}
exports.create = function(req, res) {
  //var filmUrlList = siteMapFinderImdb();
  var counter = 0;
  var saveCounter = 0;
  var errorCounter = 0;
  /*while(!siteMapFinderImdbFlag){require('deasync').sleep(100);}
  filmUrlList.forEach(function(value){
    findImdb(req,value.link);
  });*/



  function findImdb (req,url) {
    console.log('Started imdb function. ' + url);
    var film = new Film(req);
    request(String(url), function (error, response, html) {
      console.log('Started request: ' + url);
      if (!error && response.statusCode === 200) {
        console.log('Without error code');
        var $ = cheerio.load(html);
        $('.title_wrapper').filter(function () {
          var title = $(this).children().first().text();
          title = title.replace(/^\s+|\s+$/g, '');
          title = title.substring(0, title.length - 7);
          film.title = title;
        });
        $('#titleYear').filter(function () {
          film.release = $(this).children().first().text();
        });
        $('.ratingValue').filter(function () {
          film.rating = $(this).children().first().text();
        });
        $('.subtext span[itemprop="genre"]').filter(function () {
          film.type.push($(this).text());
        });
        $('#titleDetails').find('.txt-block time[itemprop="duration"]').filter(function () {
          film.duration = $(this).text();
        });
        $('#titleAwardsRanks').find('span[itemprop="awards"] b').filter(function () {
          //film.won = $(this).text();
        });
        $('.credit_summary_item span[itemprop="director"] span[itemprop="name"]').filter(function () {
          film.director = $(this).text();
        });
        $('#titleCast').find('span[itemprop="name"]').filter(function () {
          film.cast.push($(this).text());
        });
        $('#titleDetails').find('a[href*="country"]').filter(function () {
          film.country = $(this).text();
        });
        film.baseSite = 'imdb.com';
        counter++;
        var suma = counter + errorCounter;
        console.log(suma);
        return save(film);
      }
      else {
        errorCounter++;
        console.log('Błąd: ' + error);
        console.log('Counter: ' + counter);
        console.log('SaveCounter: ' + saveCounter);
        console.log('ErrorCounter: '+ errorCounter);
        findImdb (req,url);
      }

    });
  }
  function save(film){
    film.save(function(err) {
      saveCounter++;
      if (err) {
        console.log(film);
        return res.status(400).send({
          message: errorHandler.getErrorMessage(err)
        });
      }
      else {
       // while(counter !== 250){require('deasync').sleep(100);}
       // res.jsonp(film);
      }
    });
  }
};

/**
 * Show the current Film
 */
exports.read = function(req, res) {
  // convert mongoose document to JSON
  var film = req.film ? req.film.toJSON() : {};

  // Add a custom field to the Article, for determining if the current User is the "owner".
  // NOTE: This field is NOT persisted to the database, since it doesn't exist in the Article model.
  film.isCurrentUserOwner = req.user && film.user && film.user._id.toString() === req.user._id.toString() ? true : false;
  res.jsonp(film);
};

/**
 * Update a Film
 */
exports.update = function(req, res) {
  var film = req.film ;

  film = _.extend(film , req.body);

  film.save(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(film);
    }
  });
};

/**
 * Delete an Film
 */
exports.delete = function(req, res) {
  var film = req.film ;

  film.remove(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(film);
    }
  });
};

/**
 * List of Films
 */
exports.list = function(req, res) {
  Film.find().sort('-created').populate('user', 'displayName').exec(function(err, films) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(films);
    }
  });
};
exports.countryList = function(req, res){
  console.log('started country list exports');
  Film.find().distinct('type').exec(function(err, films) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(films);
    }
  });
};

/**
 * Film middleware
 */
exports.filmByID = function(req, res, next, id) {

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'Film is invalid'
    });
  }
  Film.findById(id).populate('user', 'displayName').exec(function (err, film) {
    if (err) {
      return next(err);
    } else if (!film) {
      return res.status(404).send({
        message: 'No Film with that identifier has been found'
      });
    }
    req.film = film;
    next();
  });

};
