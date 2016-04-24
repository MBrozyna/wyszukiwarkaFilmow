(function () {
  'use strict';

  describe('Films Route Tests', function () {
    // Initialize global variables
    var $scope,
      FilmsService;

    //We can start by loading the main application module
    beforeEach(module(ApplicationConfiguration.applicationModuleName));

    // The injector ignores leading and trailing underscores here (i.e. _$httpBackend_).
    // This allows us to inject a service but then attach it to a variable
    // with the same name as the service.
    beforeEach(inject(function ($rootScope, _FilmsService_) {
      // Set a new global scope
      $scope = $rootScope.$new();
      FilmsService = _FilmsService_;
    }));

    describe('Route Config', function () {
      describe('Main Route', function () {
        var mainstate;
        beforeEach(inject(function ($state) {
          mainstate = $state.get('films');
        }));

        it('Should have the correct URL', function () {
          expect(mainstate.url).toEqual('/films');
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
          FilmsController,
          mockFilm;

        beforeEach(inject(function ($controller, $state, $templateCache) {
          viewstate = $state.get('films.view');
          $templateCache.put('modules/films/client/views/view-film.client.view.html', '');

          // create mock Film
          mockFilm = new FilmsService({
            _id: '525a8422f6d0f87f0e407a33',
            name: 'Film Name'
          });

          //Initialize Controller
          FilmsController = $controller('FilmsController as vm', {
            $scope: $scope,
            filmResolve: mockFilm
          });
        }));

        it('Should have the correct URL', function () {
          expect(viewstate.url).toEqual('/:filmId');
        });

        it('Should have a resolve function', function () {
          expect(typeof viewstate.resolve).toEqual('object');
          expect(typeof viewstate.resolve.filmResolve).toEqual('function');
        });

        it('should respond to URL', inject(function ($state) {
          expect($state.href(viewstate, {
            filmId: 1
          })).toEqual('/films/1');
        }));

        it('should attach an Film to the controller scope', function () {
          expect($scope.vm.film._id).toBe(mockFilm._id);
        });

        it('Should not be abstract', function () {
          expect(viewstate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(viewstate.templateUrl).toBe('modules/films/client/views/view-film.client.view.html');
        });
      });

      describe('Create Route', function () {
        var createstate,
          FilmsController,
          mockFilm;

        beforeEach(inject(function ($controller, $state, $templateCache) {
          createstate = $state.get('films.create');
          $templateCache.put('modules/films/client/views/form-film.client.view.html', '');

          // create mock Film
          mockFilm = new FilmsService();

          //Initialize Controller
          FilmsController = $controller('FilmsController as vm', {
            $scope: $scope,
            filmResolve: mockFilm
          });
        }));

        it('Should have the correct URL', function () {
          expect(createstate.url).toEqual('/create');
        });

        it('Should have a resolve function', function () {
          expect(typeof createstate.resolve).toEqual('object');
          expect(typeof createstate.resolve.filmResolve).toEqual('function');
        });

        it('should respond to URL', inject(function ($state) {
          expect($state.href(createstate)).toEqual('/films/create');
        }));

        it('should attach an Film to the controller scope', function () {
          expect($scope.vm.film._id).toBe(mockFilm._id);
          expect($scope.vm.film._id).toBe(undefined);
        });

        it('Should not be abstract', function () {
          expect(createstate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(createstate.templateUrl).toBe('modules/films/client/views/form-film.client.view.html');
        });
      });

      describe('Edit Route', function () {
        var editstate,
          FilmsController,
          mockFilm;

        beforeEach(inject(function ($controller, $state, $templateCache) {
          editstate = $state.get('films.edit');
          $templateCache.put('modules/films/client/views/form-film.client.view.html', '');

          // create mock Film
          mockFilm = new FilmsService({
            _id: '525a8422f6d0f87f0e407a33',
            name: 'Film Name'
          });

          //Initialize Controller
          FilmsController = $controller('FilmsController as vm', {
            $scope: $scope,
            filmResolve: mockFilm
          });
        }));

        it('Should have the correct URL', function () {
          expect(editstate.url).toEqual('/:filmId/edit');
        });

        it('Should have a resolve function', function () {
          expect(typeof editstate.resolve).toEqual('object');
          expect(typeof editstate.resolve.filmResolve).toEqual('function');
        });

        it('should respond to URL', inject(function ($state) {
          expect($state.href(editstate, {
            filmId: 1
          })).toEqual('/films/1/edit');
        }));

        it('should attach an Film to the controller scope', function () {
          expect($scope.vm.film._id).toBe(mockFilm._id);
        });

        it('Should not be abstract', function () {
          expect(editstate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(editstate.templateUrl).toBe('modules/films/client/views/form-film.client.view.html');
        });

        xit('Should go to unauthorized route', function () {

        });
      });

    });
  });
})();
