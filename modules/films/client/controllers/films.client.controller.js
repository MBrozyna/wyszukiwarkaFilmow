(function () {
  'use strict';

  // Films controller
  angular
    .module('films')
    .controller('FilmsController', FilmsController);

  FilmsController.$inject = ['$scope', '$state', '$q', 'Authentication', 'filmResolve', 'FilmsService'];

  function FilmsController ($scope, $state, $q, Authentication, film, FilmsService) {
    var vm = this;

    vm.authentication = Authentication;
    vm.film = film;
    vm.films = [];
    vm.types = [];
    vm.cast = [];
    vm.countries = [];
    doQuery().then(function(films){
      var arrTypes = [];
      var arrCountry= [];
      var arrActor = [];
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
        for(j=0;j<films[i].cast.length;j++){
          if (arrActor.indexOf(films[i].cast[j]) === -1) {
            arrActor.push(films[i].cast[j]);
          }
        }
      }
      vm.films = films;
      vm.countries = arrCountry;
      vm.cast = arrActor;
      vm.types = arrTypes;
    },
    function(){
      console.log('error');
    });
    vm.error = null;
    vm.form = {};
    vm.remove = remove;
    vm.save = save;

    function doQuery(){
      var d = $q.defer();
      var result = FilmsService.query({},function(){
        d.resolve(result);
      });
      return d.promise;
    }

    // Remove existing Film
    function remove() {
      if (confirm('Czy chcesz usunąć')) {
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
        if(res.data !== null){
          vm.error = res.data.message;
        }
      }
    }
  }
})();
