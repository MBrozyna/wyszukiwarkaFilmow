'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
  cheerio = require('cheerio'),
  fs = require('fs'),
  request = require('request'),
  Film = mongoose.model('Film'),
  FilmUrl = mongoose.model('FilmUrl'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  _ = require('lodash'),
  siteMapFinderImdbFlag = false,
  siteMapFinderFilmwebFlag = false,
  siteMapFinderFilmasterFlag = false,
  updateFlag = false,
  genreDictionary = [{ key: 'Action', value: 'Akcja' }, { key: 'Adventure', value: 'Przygodowy' }, { key: 'Animation', value: 'Animacja' }, { key: 'Biography', value: 'Biograficzny' }, { key: 'Comedy', value: 'Komedia' }, { key: 'Crime', value: 'Gangsterski' }, { key: 'Documentary', value: 'Dokumentalny' }, { key: 'Drama', value: 'Dramat' }, { key: 'Family', value: 'Familijny' }, { key: 'Fantasy', value: 'Fantasy' }, { key: 'Film-Noir', value: 'Film-Noir' }, { key: 'History', value: 'Historyczny' }, { key: 'Horror', value: 'Horror' }, { key: 'Music', value: 'Muzyczny' }, { key: 'Musical', value: 'Musical' }, { key: 'Mystery', value: 'Baśń' }, { key: 'Romance', value: 'Romans' }, { key: 'Sci-Fi', value: 'Sci-Fi' }, { key: 'Sport', value: 'Sportowy' }, { key: 'Thriller', value: 'Thriller' }, { key: 'War', value: 'Wojenny' }, { key: 'Western', value: 'Western' }],
  countriesDictionary = [{ key: 'Argentina', value: 'Argentyna' }, { key: 'Australia', value: 'Australia' }, { key: 'Austria', value: 'Austria' }, { key: 'Belgium', value: 'Belgia' }, { key: 'Brazil', value: 'Brazylia' },{ key: 'Bulgaria', value: 'Bułgaria' }, { key: 'Canada', value: 'Kanada' }, { key: 'China', value: 'Chiny' }, { key: 'Colombia', value: 'Kolumbia' },{ key: 'Costa Rica', value: 'Kostaryka' }, { key: 'Czech Republic', value: 'Czechy' }, { key: 'Denmark', value: 'Dania' }, { key: 'Finland', value: 'Finlandia' }, { key: 'France', value: 'Francja' }, { key: 'Germany', value: 'Niemcy' },{ key: 'Greece', value: 'Grecja' }, { key: 'Hong Kong', value: 'Hongkong' }, { key: 'Hungary', value: 'Węgry' }, { key: 'Iceland', value: 'Islandia' }, { key: 'India', value: 'Indie' }, { key: 'Iran', value: 'Iran' }, { key: 'Ireland', value: 'Irlandia' }, { key: 'Italy', value: 'Włochy' }, { key: 'Japan', value: 'Japonia' }, { key: 'Malaysia', value: 'Malezja' },{ key: 'Mexico', value: 'Meksyk' }, { key: 'Netherlands', value: 'Holandia' } , { key: 'New Zealand', value: 'Nowa Zelandia' }, { key: 'Pakistan', value: 'Pakistan' }, { key: 'Poland', value: 'Polska' }, { key: 'Portugal', value: 'Portugalia' }, { key: 'Romania', value: 'Rumunia' }, { key: 'Russia', value: 'Rosja' }, { key: 'Singapore', value: 'Singapur' }, { key: 'South Africa', value: 'RPA' },{ key: 'Spain', value: 'Hiszpania' }, { key: 'Sweden', value: 'Szwecja' }, { key: 'Switzerland', value: 'Szwajcaria' }, { key: 'Thailand', value: 'Tajlandia' }, { key: 'United Kingdom', value: 'Wielka Brytania' }, { key: 'United States', value: 'USA' }];

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
  });
  while(filmUrlList.length !== 500){require('deasync').sleep(100);}
  siteMapFinderImdbFlag = true;
  return filmUrlList;
}
function siteMapFinderFilmweb(){
  var urlList = filmwebLinkGenerator();
  var filmUrlList = [];
  for(var i=0;i<urlList.length;i++){
    /*jshint loopfunc: true */
    request(urlList[i],function (error, response, html) {
      if (!error && response.statusCode === 200) {
        var $ = cheerio.load(html);
        $('.filmContent').filter(function () {
          var filmUrl = new FilmUrl();
          if(typeof $(this).children().children().attr('href') !== 'undefined'){
            filmUrl.link = 'http://www.filmweb.pl' + $(this).children().children().attr('href');
            console.log(filmUrl.link);
            filmUrlList.push(filmUrl);
          }
        });
      }
    });
  }
  siteMapFinderFilmwebFlag = true;
  while(filmUrlList.length !== (urlList.length * 10)){require('deasync').sleep(100);}
  return filmUrlList;
}
function siteMapFinderFimaster(){
  var urlList = filmasterLinkGenerator();
  var filmUrlList = [];
  for(var i=0;i<urlList.length;i++){
    /*jshint loopfunc: true */
    request(urlList[i],function (error, response, html) {
      if (!error && response.statusCode === 200) {
        var $ = cheerio.load(html);
        $('.t').filter(function () {
          filmUrlList.push($(this).attr('href'));
        });
      }
    });
  }
  siteMapFinderFilmasterFlag = true;
  while(filmUrlList.length !== (urlList.length * 10)){require('deasync').sleep(100);}
  return filmUrlList;
}
function filmasterLinkGenerator(){
  var url = 'http://filmaster.pl/rankingi/?page=';
  var urlLink = [];
  for(var i=1;i<78;i++){
    urlLink.push(url + i.toString());
  }
  return urlLink;
}
function filmwebLinkGenerator(){
  var url = 'http://www.filmweb.pl/search/film?q=&type=&startYear=&endYear=&countryIds=&genreIds=&startRate=&endRate=&startCount=&endCount=&sort=COUNT&sortAscending=false&c=portal&page=';
  var urlLink = [];
  for(var i=1; i<100;i++){
    urlLink.push(url + i.toString());
  }
  return urlLink;
}
exports.create = function(req, res) {

  var addedImdbFlag = false;

  if(req.body.imdb){
    var filmUrlList = siteMapFinderImdb();
    while(!siteMapFinderImdbFlag){require('deasync').sleep(100);}
    filmUrlList.forEach(function(value){
      findImdb(req,value.link);
    });
  }
  if(req.body.filmweb){
    var filmUrlListFilmweb = siteMapFinderFilmweb();
    while(!siteMapFinderFilmwebFlag){require('deasync').sleep(100);}
    filmUrlListFilmweb.forEach(function(value){
      findFilmweb(req,value.link);
    });
  }
  if(req.body.filmaster){
    var filmUrlListFilmaster = siteMapFinderFimaster();
    while(!siteMapFinderFilmasterFlag){require('deasync').sleep(100);}
    filmUrlListFilmaster.forEach(function(value){
      findFilmaster(req,value.link);
    });
  }

  function findImdb (req,url) {
    console.log('Started imdb function. ' + url);
    var film = new Film(req);
    request(String(url), function (error, response, html) {
      console.log('Started request: ' + url);
      if (!error && response.statusCode === 200) {
        var $ = cheerio.load(html);
        $('.title_wrapper').filter(function () {
          var title = $(this).children().first().text();
          title = title.replace(/^\s+|\s+$/g, '');
          title = title.substring(0, title.length - 7);
          film.title = title;
        });
        $('.originalTitle').filter(function () {
          var originalTitle = $(this).text();
          film.originalTitle = originalTitle.substring(0,originalTitle.length-17);
        });
        $('#titleYear').filter(function () {
          film.release = $(this).children().first().text();
        });
        $('.ratingValue').filter(function () {
          film.ratingImdb = $(this).children().first().text();
        });
        $('.subtext span[itemprop="genre"]').filter(function () {
          film.type.push($(this).text());
        });
        $('#titleDetails').find('.txt-block time[itemprop="duration"]').filter(function () {
          film.duration = $(this).text();
        });
        $('.credit_summary_item span[itemprop="director"] span[itemprop="name"]').filter(function () {
          film.director = $(this).text();
        });
        $('#titleCast').find('span[itemprop="name"]').filter(function () {
          film.cast.push($(this).text());
        });
        $('#titleDetails').find('a[href*="country"]').filter(function () {
          film.country.push($(this).text());
        });
        if (film.originalTitle === '') {
          film.originalTitle = film.title;
        }
        addedImdbFlag = true;
      }
      else {
        findImdb(req, url);
      }
    });
    while(!addedImdbFlag){require('deasync').sleep(100);}
    addedImdbFlag = false;
    update(res, film, Film);
  }

  function findFilmweb(req,url){
    console.log('Started filmweb function. ' + url);
    var film = new Film(req);
    var awardsFlag = false;
    var defaultFlag = false;
    request(String(url), function (error, response, html) {
      console.log('Started request: ' + url);
      if (!error && response.statusCode === 200) {
        var $ = cheerio.load(html);
        $('.inline').find('a[property="v:name"]').filter(function () {
          var title = $(this).text();
          film.title = title;
          console.log(title);
        });
        $('.filmMainHeader').children().find('h2').first().filter(function () {
          film.originalTitle = $(this).text();
        });

        $('.halfSize').filter(function () {
          var release = $(this).first().text();
          film.release = release.substring(1, release.length - 2);
        });
        $('.s-42').filter(function () {
          film.ratingFilmweb = $(this).children().first().text().trim();
        });
        $('.genresList li').filter(function () {
          var value = $(this);
          for(var i =0; i<$(this).length;i++){
            console.log(value.text() + ', ' + value.next().text());
            film.type.push(value.text());
            value = $(this).next();
          }
        });
        $('.inline').find('a[rel="v:directedBy"]').filter(function () {
          film.director.push($(this).text());
        });
        $('.inline').find('a[href*="countryIds"]').filter(function () {
          film.country.push($(this).text());
        });
        $('.filmPlot').filter(function () {
          film.description = $(this).children().text();
        });
        if(film.originalTitle === ''){
          film.originalTitle = ogiginalTitleReplace(film.title);
        }
        $('.filmCast').children().find('a[rel="v:starring"]').filter(function () {
          film.cast.push($(this).text());
        });
        $('.posterLightbox').find('a[rel="v:image"]').filter(function () {
          film.img = $(this).attr('href');
        });
        defaultFlag =true;
      }
      else {
        findFilmweb(req, url);
      }
    });
    request(String(url + '/awards'), function (error, response, html) {
      if (!error && response.statusCode === 200) {
        var $ = cheerio.load(html);
        $('.awardCounter').filter(function () {
          
          var won = $(this).children().text().match(/\d+/g);
          if(typeof won !== 'undefined' && won !== null){
            if(won.length === 2){
              film.won = won[0];
              film.nominations = won[1];
            }
            else if(won.length === 1){
              if($(this).children().text().indexOf('nominacje') > -1){
                film.nominations = won[0];
              }
              else if ($(this).children().text().indexOf('wygrane') > -1){
                film.won = won[0];
              }
            }
          }
          awardsFlag = true;
        });
      }
      else {
        findFilmweb(req, url);
      }
    });
    while(!awardsFlag){require('deasync').sleep(100);}
    while(!defaultFlag){require('deasync').sleep(100);}
    update(res, film, Film);
  }
  function save(film){
    film.save(function(err) {
      if (err) {
        console.log(film);
        return res.status(400).send({
          message: errorHandler.getErrorMessage(err)
        });
      }
      else {
      }
    });
  }
};
function update(res, film, Film){
  console.log(film.title + ', ' + film.release);
  Film.find({ title: film.title }, { release: film.release }).exec(function(err, filmFound) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    }
    else if(filmFound.length === 0){
      film.save(function (err) {
        if(err) {
          console.error('ERROR!');
        }
      });
    }
    else if(filmFound.length === 1){
      var filmToUpdate = filmFound[0];
      if(film.ratingFilmaster !== '0'){
        filmToUpdate.ratingFilmaster = film.ratingFilmaster;
      }
      if(film.ratingFilmweb !== '0'){
        //filmFound.ratingFilmweb = film.ratingFilmweb;
        filmToUpdate.ratingFilmweb = film.ratingFilmweb;
      }
      if(film.ratingImdb !== '0'){
        filmToUpdate.ratingImdb = film.ratingImdb;
      }
      if(film.duration !== '' && typeof filmToUpdate.duration === 'undefined'){
        filmToUpdate.duration = film.duration;
      }
      if(film.description !== '' && filmToUpdate.description === ''){
        filmToUpdate.description = film.description;
      }
      if(film.img !== '' && filmToUpdate.img === ''){
        filmToUpdate.img = film.img;
      }
      filmToUpdate.cast = _.union(film.cast, filmToUpdate.cast);
      filmToUpdate.director = _.union(film.director, filmToUpdate.director);

      for(var i =0; i<film.type.length; i++){
        var typ = findInDictionary(genreDictionary,film.type[i]);
        if(typeof typ !== 'undefined'){
          film.type[i] = typ;
        }
      }
      filmToUpdate.type = _.union(film.type, filmToUpdate.type);
      for(var j=0; j<film.country.length; j++){
        var kraj = findInDictionary(countriesDictionary, film.country[j]);
        if(typeof kraj !== 'undefined'){
          film.country[j] = kraj;
        }
      }
      filmToUpdate.country = _.union(film.country, filmToUpdate.country);

      filmToUpdate.save(function (err) {
        if(err) {
          console.error('ERROR!');
        }
      });
    }
  });
}

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

exports.filmByTitleAndYear = function(req,res,film){
  Film.find({ title: film.title }).exec(function(err,filmFound){
    if (err){
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      console.log(filmFound);
      return filmFound;
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
//helpers
function arrayUnique(array) {
  var a = array.concat();
  for(var i=0; i<a.length; ++i) {
    for(var j=i+1; j<a.length; ++j) {
      if(typeof a[i] !== 'undefined' && typeof a[j] !== 'undefined'){
        if(a[i] === a[j])
          a.splice(j--, 1);
      }
    }
  }
  return a;
}
function findInDictionary(dict,key){
  var value;
  dict.forEach(function(record){
    if(key === record.key){
      value = record.value;
    }
  });
  return value;
}
function ogiginalTitleReplace(string){
  var replace0 = string.replace(/ą/g,"a");
  var replace1 = replace0.replace(/ę/g, "e");
  var replace2 = replace1.replace(/ż/g, "z");
  var replace3 = replace2.replace(/ć/g, "c");
  var replace4 = replace3.replace(/ł/g, "l");
  var replace5 = replace4.replace(/ś/g, "s");
  var replace6 = replace5.replace(/ń/g, "n");
  var replace7 = replace6.replace(/ź/g, "z");
  return replace7;
}
