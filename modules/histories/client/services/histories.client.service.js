//Histories service used to communicate Histories REST endpoints
(function () {
  'use strict';

  angular
    .module('histories')
    .factory('HistoriesService', HistoriesService);

  HistoriesService.$inject = ['$resource'];

  function HistoriesService($resource) {
    return $resource('api/histories/:historyId', {
      historyId: '@_id'
    }, {
      update: {
        method: 'PUT'
      }
    });
  }
})();
