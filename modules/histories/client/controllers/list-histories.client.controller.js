(function () {
  'use strict';

  angular
    .module('histories')
    .controller('HistoriesListController', HistoriesListController);

  HistoriesListController.$inject = ['HistoriesService'];

  function HistoriesListController(HistoriesService) {
    var vm = this;

    vm.histories = HistoriesService.query();
  }
})();
