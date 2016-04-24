//Films service used to communicate Films REST endpoints
(function () {
  'use strict';

  angular
    .module('films')
    .factory('FilmsService', FilmsService);

  FilmsService.$inject = ['$resource'];

  function FilmsService($resource) {
    return $resource('api/films/:filmId', {
      filmId: '@_id'
    }, {
      update: {
        method: 'PUT'
      }
    });
  }
})();
