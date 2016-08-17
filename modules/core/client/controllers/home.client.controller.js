(function () {
  'use strict';

  angular
    .module('core')
    .controller('HomeController', HomeController);

  HomeController.$inject = ['FilmsService', '$q', 'Authentication', '$scope', '$filter', 'Admin', '$state', 'HistoriesService'];



  function HomeController(FilmsService, $q, Authentication ,$scope, $filter, Admin, $state, HistoriesService) {

    var vm = this;
    $scope.history = new HistoriesService();
    $scope.authentication = Authentication;

    function doQuery(){
      var d = $q.defer();
      var result = FilmsService.query({},function(){
        d.resolve(result);
      });
      return d.promise;
    }
    doQuery().then(function(films){
      var arrTypes = [];
      var arrCountry= [];
      for(var i =0; i<films.length;i++){
        for(var j=0;j<films[i].type.length;j++){
          if (arrTypes.indexOf(films[i].type[j]) === -1) {
            arrTypes.push(films[i].type[j]);
          }
        }
        for(j=0;j<films[i].country.length;j++){
          if (arrCountry.indexOf(films[i].country[j]) === -1) {
            arrCountry.push(films[i].country[j]);
          }
        }
      }
      $scope.countries = arrCountry;
      $scope.types = arrTypes;
    },
    function(){
      console.log('error');
    });
/*
    function doQueryHistory(){
      var d = $q.defer();
      var result = HistoriesService.query({},function(){
        d.resolve(result);
      });
      return d.promise;
    }
    doQueryHistory().then(function(history){
          $scope.histories = history.slice(Math.max(history.length -4 ,history.length ))
        },
        function(){
          console.log('error');
        });*/

    $scope.error = null;
    $scope.form = {};
    $scope.find = find;


    function find(isValid) {
      console.log('find function');
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'vm.form.filmForm');
        return false;
      }
      $scope.history.$save(successCallback, errorCallback);

      function successCallback(res) {
        $state.go('films.view', {
          filmId: res._id
        });
      }

      function errorCallback(res) {
        if(res.data !== null){
          $scope.error = res.data.message;
        }
      }
    }
  }
})();

