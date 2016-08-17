(function () {
  'use strict';

  // Histories controller
  angular
    .module('histories')
    .controller('HistoriesController', HistoriesController);

  HistoriesController.$inject = ['$scope', '$state', 'Authentication', 'historyResolve'];

  function HistoriesController ($scope, $state, Authentication, history) {
    var vm = this;

    vm.authentication = Authentication;
    vm.history = history;
    vm.error = null;
    vm.form = {};
    vm.remove = remove;
    vm.save = save;

    // Remove existing History
    function remove() {
      if (confirm('Are you sure you want to delete?')) {
        vm.history.$remove($state.go('histories.list'));
      }
    }

    // Save History
    function save(isValid) {
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'vm.form.historyForm');
        return false;
      }

      // TODO: move create/update logic to service
      if (vm.history._id) {
        vm.history.$update(successCallback, errorCallback);
      } else {
        vm.history.$save(successCallback, errorCallback);
      }

      function successCallback(res) {
        $state.go('histories.view', {
          historyId: res._id
        });
      }

      function errorCallback(res) {
        vm.error = res.data.message;
      }
    }
  }
})();
