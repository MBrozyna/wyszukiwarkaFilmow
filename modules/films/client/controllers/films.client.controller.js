(function () {
  'use strict';

  // Films controller
  angular
    .module('films')
    .controller('FilmsController', FilmsController);

  FilmsController.$inject = ['Authentication', 'filmResolve'];

  function FilmsController (Authentication, film) {
    var vm = this;
    vm.authentication = Authentication;
    vm.film = film;
  }
})();
