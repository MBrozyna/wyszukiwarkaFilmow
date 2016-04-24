(function () {
  'use strict';

  angular
    .module('films')
    .controller('FilmsListController', FilmsListController);

  FilmsListController.$inject = ['FilmsService'];

  function FilmsListController(FilmsService) {
    var vm = this;

    vm.films = FilmsService.query();
  }
})();
