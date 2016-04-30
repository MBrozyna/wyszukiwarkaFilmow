(function () {
  'use strict';

  // Films controller
  angular
    .module('films')
    .controller('FilmsController', FilmsController);

  FilmsController.$inject = ['$scope', '$state', 'Authentication', 'filmResolve'];

  function FilmsController ($scope, $state, Authentication, film) {
    var vm = this;

    vm.authentication = Authentication;
    vm.film = film;
    vm.error = null;
    vm.form = {};
    vm.remove = remove;
    vm.save = save;

    // Remove existing Film
    function remove() {
      if (confirm('Are you sure you want to delete?')) {
        vm.film.$remove($state.go('films.list'));
      }
    }

    // Save Film
    function save(isValid) {
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'vm.form.filmForm');
        return false;
      }

      // TODO: move create/update logic to service
      if (vm.film._id) {
        vm.film.$update(successCallback, errorCallback);
      } else {
        vm.film.$save(successCallback, errorCallback);
      }

      function successCallback(res) {
        $state.go('films.view', {
          filmId: res._id
        });
      }

      function errorCallback(res) {
        vm.error = res.data.message;
      }
    }
  }
})();
