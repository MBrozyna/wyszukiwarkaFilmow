(function () {
  'use strict';

  describe('Histories Route Tests', function () {
    // Initialize global variables
    var $scope,
      HistoriesService;

    //We can start by loading the main application module
    beforeEach(module(ApplicationConfiguration.applicationModuleName));

    // The injector ignores leading and trailing underscores here (i.e. _$httpBackend_).
    // This allows us to inject a service but then attach it to a variable
    // with the same name as the service.
    beforeEach(inject(function ($rootScope, _HistoriesService_) {
      // Set a new global scope
      $scope = $rootScope.$new();
      HistoriesService = _HistoriesService_;
    }));

    describe('Route Config', function () {
      describe('Main Route', function () {
        var mainstate;
        beforeEach(inject(function ($state) {
          mainstate = $state.get('histories');
        }));

        it('Should have the correct URL', function () {
          expect(mainstate.url).toEqual('/histories');
        });

        it('Should be abstract', function () {
          expect(mainstate.abstract).toBe(true);
        });

        it('Should have template', function () {
          expect(mainstate.template).toBe('<ui-view/>');
        });
      });

      describe('View Route', function () {
        var viewstate,
          HistoriesController,
          mockHistory;

        beforeEach(inject(function ($controller, $state, $templateCache) {
          viewstate = $state.get('histories.view');
          $templateCache.put('modules/histories/client/views/view-history.client.view.html', '');

          // create mock History
          mockHistory = new HistoriesService({
            _id: '525a8422f6d0f87f0e407a33',
            name: 'History Name'
          });

          //Initialize Controller
          HistoriesController = $controller('HistoriesController as vm', {
            $scope: $scope,
            historyResolve: mockHistory
          });
        }));

        it('Should have the correct URL', function () {
          expect(viewstate.url).toEqual('/:historyId');
        });

        it('Should have a resolve function', function () {
          expect(typeof viewstate.resolve).toEqual('object');
          expect(typeof viewstate.resolve.historyResolve).toEqual('function');
        });

        it('should respond to URL', inject(function ($state) {
          expect($state.href(viewstate, {
            historyId: 1
          })).toEqual('/histories/1');
        }));

        it('should attach an History to the controller scope', function () {
          expect($scope.vm.history._id).toBe(mockHistory._id);
        });

        it('Should not be abstract', function () {
          expect(viewstate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(viewstate.templateUrl).toBe('modules/histories/client/views/view-history.client.view.html');
        });
      });

      describe('Create Route', function () {
        var createstate,
          HistoriesController,
          mockHistory;

        beforeEach(inject(function ($controller, $state, $templateCache) {
          createstate = $state.get('histories.create');
          $templateCache.put('modules/histories/client/views/form-history.client.view.html', '');

          // create mock History
          mockHistory = new HistoriesService();

          //Initialize Controller
          HistoriesController = $controller('HistoriesController as vm', {
            $scope: $scope,
            historyResolve: mockHistory
          });
        }));

        it('Should have the correct URL', function () {
          expect(createstate.url).toEqual('/create');
        });

        it('Should have a resolve function', function () {
          expect(typeof createstate.resolve).toEqual('object');
          expect(typeof createstate.resolve.historyResolve).toEqual('function');
        });

        it('should respond to URL', inject(function ($state) {
          expect($state.href(createstate)).toEqual('/histories/create');
        }));

        it('should attach an History to the controller scope', function () {
          expect($scope.vm.history._id).toBe(mockHistory._id);
          expect($scope.vm.history._id).toBe(undefined);
        });

        it('Should not be abstract', function () {
          expect(createstate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(createstate.templateUrl).toBe('modules/histories/client/views/form-history.client.view.html');
        });
      });

      describe('Edit Route', function () {
        var editstate,
          HistoriesController,
          mockHistory;

        beforeEach(inject(function ($controller, $state, $templateCache) {
          editstate = $state.get('histories.edit');
          $templateCache.put('modules/histories/client/views/form-history.client.view.html', '');

          // create mock History
          mockHistory = new HistoriesService({
            _id: '525a8422f6d0f87f0e407a33',
            name: 'History Name'
          });

          //Initialize Controller
          HistoriesController = $controller('HistoriesController as vm', {
            $scope: $scope,
            historyResolve: mockHistory
          });
        }));

        it('Should have the correct URL', function () {
          expect(editstate.url).toEqual('/:historyId/edit');
        });

        it('Should have a resolve function', function () {
          expect(typeof editstate.resolve).toEqual('object');
          expect(typeof editstate.resolve.historyResolve).toEqual('function');
        });

        it('should respond to URL', inject(function ($state) {
          expect($state.href(editstate, {
            historyId: 1
          })).toEqual('/histories/1/edit');
        }));

        it('should attach an History to the controller scope', function () {
          expect($scope.vm.history._id).toBe(mockHistory._id);
        });

        it('Should not be abstract', function () {
          expect(editstate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(editstate.templateUrl).toBe('modules/histories/client/views/form-history.client.view.html');
        });

        xit('Should go to unauthorized route', function () {

        });
      });

    });
  });
})();
