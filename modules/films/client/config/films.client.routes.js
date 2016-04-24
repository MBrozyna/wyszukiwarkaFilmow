(function () {
  'use strict';

  angular
    .module('films')
    .config(routeConfig);

  routeConfig.$inject = ['$stateProvider'];

  function routeConfig($stateProvider) {
    $stateProvider
      .state('films', {
        abstract: true,
        url: '/films',
        template: '<ui-view/>'
      })
      .state('films.list', {
        url: '',
        templateUrl: 'modules/films/client/views/list-films.client.view.html',
        controller: 'FilmsListController',
        controllerAs: 'vm',
        data: {
          pageTitle: 'Films List'
        }
      })
      .state('films.create', {
        url: '/create',
        templateUrl: 'modules/films/client/views/form-film.client.view.html',
        controller: 'FilmsController',
        controllerAs: 'vm',
        resolve: {
          filmResolve: newFilm
        },
        data: {
          roles: ['user', 'admin'],
          pageTitle : 'Films Create'
        }
      })
      .state('films.edit', {
        url: '/:filmId/edit',
        templateUrl: 'modules/films/client/views/form-film.client.view.html',
        controller: 'FilmsController',
        controllerAs: 'vm',
        resolve: {
          filmResolve: getFilm
        },
        data: {
          roles: ['user', 'admin'],
          pageTitle: 'Edit Film {{ filmResolve.name }}'
        }
      })
      .state('films.view', {
        url: '/:filmId',
        templateUrl: 'modules/films/client/views/view-film.client.view.html',
        controller: 'FilmsController',
        controllerAs: 'vm',
        resolve: {
          filmResolve: getFilm
        },
        data:{
          pageTitle: 'Film {{ articleResolve.name }}'
        }
      })
        .state('Scrapper', {
          url: '/scrapper',
          templateUrl: 'modules/films/client/views/auto-scrapper.client.view.html',
          controller: 'FilmsController',
          controllerAs: 'vm',
          resolve: {
            filmResolve: newFilm
          },
          data:{
            pageTitle: 'Run auto scrapping'
          }
        })
        .state('Scrapper.createSitemap', {
          url: '/createSitemap',
          templateUrl: 'modules/films/client/views/create-sitemap.client.view.html',
          controller: 'FilmsController',
          controllerAs: 'vm',
          resolve: {
            filmResolve: newFilm
          }
        });
  }

  getFilm.$inject = ['$stateParams', 'FilmsService'];

  function getFilm($stateParams, FilmsService) {
    return FilmsService.get({
      filmId: $stateParams.filmId
    }).$promise;
  }

  newFilm.$inject = ['FilmsService'];

  function newFilm(FilmsService) {
    return new FilmsService();
  }
})();
