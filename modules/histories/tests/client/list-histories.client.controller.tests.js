(function () {
  'use strict';

  describe('Histories List Controller Tests', function () {
    // Initialize global variables
    var HistoriesListController,
      $scope,
      $httpBackend,
      $state,
      Authentication,
      HistoriesService,
      mockHistory;

    // The $resource service augments the response object with methods for updating and deleting the resource.
    // If we were to use the standard toEqual matcher, our tests would fail because the test values would not match
    // the responses exactly. To solve the problem, we define a new toEqualData Jasmine matcher.
    // When the toEqualData matcher compares two objects, it takes only object properties into
    // account and ignores methods.
    beforeEach(function () {
      jasmine.addMatchers({
        toEqualData: function (util, customEqualityTesters) {
          return {
            compare: function (actual, expected) {
              return {
                pass: angular.equals(actual, expected)
              };
            }
          };
        }
      });
    });

    // Then we can start by loading the main application module
    beforeEach(module(ApplicationConfiguration.applicationModuleName));

    // The injector ignores leading and trailing underscores here (i.e. _$httpBackend_).
    // This allows us to inject a service but then attach it to a variable
    // with the same name as the service.
    beforeEach(inject(function ($controller, $rootScope, _$state_, _$httpBackend_, _Authentication_, _HistoriesService_) {
      // Set a new global scope
      $scope = $rootScope.$new();

      // Point global variables to injected services
      $httpBackend = _$httpBackend_;
      $state = _$state_;
      Authentication = _Authentication_;
      HistoriesService = _HistoriesService_;

      // create mock article
      mockHistory = new HistoriesService({
        _id: '525a8422f6d0f87f0e407a33',
        name: 'History Name'
      });

      // Mock logged in user
      Authentication.user = {
        roles: ['user']
      };

      // Initialize the Histories List controller.
      HistoriesListController = $controller('HistoriesListController as vm', {
        $scope: $scope
      });

      //Spy on state go
      spyOn($state, 'go');
    }));

    describe('Instantiate', function () {
      var mockHistoryList;

      beforeEach(function () {
        mockHistoryList = [mockHistory, mockHistory];
      });

      it('should send a GET request and return all Histories', inject(function (HistoriesService) {
        // Set POST response
        $httpBackend.expectGET('api/histories').respond(mockHistoryList);


        $httpBackend.flush();

        // Test form inputs are reset
        expect($scope.vm.histories.length).toEqual(2);
        expect($scope.vm.histories[0]).toEqual(mockHistory);
        expect($scope.vm.histories[1]).toEqual(mockHistory);

      }));
    });
  });
})();
