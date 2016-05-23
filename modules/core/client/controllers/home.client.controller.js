'use strict';

angular
    .module('core')
    .controller('HomeController', HomeController);

HomeController.$inject = ['FilmsService', '$q', 'Authentication', '$scope', '$filter', 'Admin'];



function HomeController(FilmsService, $q, Authentication ,$scope, $filter, Admin) {

  var vm = this;
  $scope.authentication = Authentication;
  vm.types = [];
  vm.countries = [];

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
        vm.countries = arrCountry;
        $scope.countries = arrCountry;
        vm.types = arrTypes;
        $scope.types = arrTypes;
      },
      function(){
        console.log('error');
      });
  vm.error = null;
  vm.form = {};
};

