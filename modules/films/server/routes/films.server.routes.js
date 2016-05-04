'use strict';

/**
 * Module dependencies
 */
var filmsPolicy = require('../policies/films.server.policy'),
  films = require('../controllers/films.server.controller');

module.exports = function(app) {
  // Films Routes
  app.route('/api/films').all(filmsPolicy.isAllowed)
/*
    .get(films.list)
*/
    .get(films.countryList)
    .post(films.create);

  app.route('/api/films/:filmId').all(filmsPolicy.isAllowed)
    .get(films.read)
    .put(films.update)
    .delete(films.delete);
  
  app.route('/api/scrapper').all(filmsPolicy.isAllowed)
      .get(films.list)
      .post(films.create);

  // Finish by binding the Film middleware
  app.param('filmId', films.filmByID);
};
