(function () {
  'use strict';

  angular
    .module('films')
    .controller('FilmsListController', FilmsListController);

  FilmsListController.$inject = ['FilmsService', '$scope', '$filter', 'Admin'];

  function FilmsListController(FilmsService, $scope, $filter) {
    var vm = this;

    //vm.films = FilmsService.query();

    FilmsService.query(function (data) {
      //vm.films = data;
      $scope.films = data;
      $scope.buildPager();
    });

    $scope.buildPager = function () {
      $scope.pagedItems = [];
      $scope.itemsPerPage = 15;
      $scope.currentPage = 1;
      $scope.figureOutItemsToDisplay();
    };

    $scope.figureOutItemsToDisplay = function () {
      $scope.filteredItems = $filter('filter')($scope.films, {
        $: $scope.search
      });
      $scope.filterLength = $scope.filteredItems.length;
      var begin = (($scope.currentPage - 1) * $scope.itemsPerPage);
      var end = begin + $scope.itemsPerPage;
      $scope.pagedItems = $scope.filteredItems.slice(begin, end);
    };

    $scope.pageChanged = function () {
      $scope.figureOutItemsToDisplay();
    };
  }
})();
