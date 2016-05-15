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
  updateFlag = false;

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
    siteMapFinderImdbFlag = true;
  });
  while(filmUrlList.length !== 500){require('deasync').sleep(100);}
  console.log(filmUrlList.length);
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
  console.log(filmUrlList.length);
  return filmUrlList;
}
function siteMapFinderFimaster(){

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
  if(req.body.imdb){
    var filmUrlList = siteMapFinderImdb();
    while(!siteMapFinderImdbFlag){require('deasync').sleep(100);}
    filmUrlList.forEach(function(value){
      findImdb(req,value.link);
    });
  }
  if(req.body.filmweb){
   /* console.log('zbieraj z filmweb');
    var filmUrlListFilmweb = siteMapFinderFilmweb();
    while(!siteMapFinderFilmwebFlag){require('deasync').sleep(100);}
    filmUrlListFilmweb.forEach(function(value){
      findFilmweb(req,value.link);
    });*/
    //findFilmweb(req,'http://www.filmweb.pl/Jak.Rozpetalem.Druga.Wojne.Swiatowa');
  }
  if(req.body.filmaster){
    console.log('zbieraj z filmaster');
    var filmUrlListFilmaster = siteMapFinderFimaster();
  }
  var counter = 0;
  var saveCounter = 0;
  var errorCounter = 0;




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

  function findFilmweb(req,url){
    console.log('Started filmweb function. ' + url);
    var film = new Film(req);
    var awardsFlag = false;
    var defaultFlag = false;
    request(String(url), function (error, response, html) {
      console.log('Started request: ' + url);
      if (!error && response.statusCode === 200) {
        console.log('Without error code');
        var $ = cheerio.load(html);
        $('.inline').find('a[property="v:name"]').filter(function () {
          var title = $(this).text();
          film.title = title;
          console.log(title);
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
        $('.filmCast').children().find('a[rel="v:starring"]').filter(function () {
          film.cast.push($(this).text());
        });
        $('.posterLightbox').find('a[rel="v:image"]').filter(function () {
          film.img = $(this).attr('href');
        });
        defaultFlag =true;
      }
      else {
        errorCounter++;
        console.log('Błąd: ' + error);
        console.log('Counter: ' + counter);
        console.log('SaveCounter: ' + saveCounter);
        console.log('ErrorCounter: ' + errorCounter);
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
        errorCounter++;
        console.log('Błąd: ' + error);
        console.log('Counter: ' + counter);
        console.log('SaveCounter: ' + saveCounter);
        console.log('ErrorCounter: ' + errorCounter);
        findFilmweb(req, url);
      }
    });
    counter++;
    var suma = counter + errorCounter;
    console.log(suma);
    while(!awardsFlag){require('deasync').sleep(100);}
    while(!defaultFlag){require('deasync').sleep(100);}
    if(false){
      return save(film);
    }
    else{
      update(res, film, Film);
    }
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
      }
    });
  }
};
function update(res, film, Film){
  Film.find({title: film.title}, {release: film.release}).exec(function(err, filmFound) {
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
        filmToUpdate.ratingFilmweb = '7.0';
      }
      if(film.ratingImdb !== '0'){
        filmToUpdate.ratingImdb = film.ratingImdb;
      }
      if(film.duration !== '' && filmToUpdate.duration === ''){
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
/*exports.countryList = function(req, res){
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
};*/

exports.filmByTitleAndYear = function(req,res,film){
  Film.find({title: film.title}).exec(function(err,filmFound){
    if (err){
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      console.log(filmFound);
      return filmFound;
    }
  })
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
function dictionary(){
  var dictionary = [{key:"key", value:"value"}];
  dictionary.push({key: 'Action', value: 'Akcja'});
  dictionary.push({key: 'Adventure', value: 'Przygodowy'});
  dictionary.push({key: 'Animation', value: 'Animacja'});
  dictionary.push({key: 'Biography', value: 'Biograficzny'});
  dictionary.push({key: 'Comedy', value: 'Komedia'});
  dictionary.push({key: 'Crime', value: 'Gangsterski'});
  dictionary.push({key: 'Documentary', value: 'Dokumentalny'});
  dictionary.push({key: 'Drama', value: 'Dramat'});
  dictionary.push({key: 'Family', value: 'Familijny'});
  dictionary.push({key: 'Fantasy', value: 'Fantasy'});
  dictionary.push({key: 'Film-Noir', value: 'Film-Noir'});
  dictionary.push({key: 'History', value: 'Historyczny'});
  dictionary.push({key: 'Horror', value: 'Horror'});
  dictionary.push({key: 'Music', value: 'Muzyczny'});
  dictionary.push({key: 'Musical', value: 'Musical'});
  dictionary.push({key: 'Mystery', value: ''});
  dictionary.push({key: 'Romance', value: 'Romans'});
  dictionary.push({key: 'Sci-Fi', value: 'Sci-Fi'});
  dictionary.push({key: 'Sport', value: 'Sportowy'});
  dictionary.push({key: 'Thriller', value: 'Thriller'});
  dictionary.push({key: 'War', value: 'Wojenny'});
  dictionary.push({key: 'Western', value: 'Western'});


}
