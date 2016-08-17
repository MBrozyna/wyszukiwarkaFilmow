(function () {
  'use strict';

  angular
    .module('histories')
    .config(routeConfig);

  routeConfig.$inject = ['$stateProvider'];

  function routeConfig($stateProvider) {
    $stateProvider
      .state('histories', {
        abstract: true,
        url: '/histories',
        template: '<ui-view/>'
      })
      .state('histories.list', {
        url: '',
        templateUrl: 'modules/histories/client/views/list-histories.client.view.html',
        controller: 'HistoriesListController',
        controllerAs: 'vm',
        data: {
          pageTitle: 'Histories List'
        }
      })
      .state('histories.create', {
        url: '/create',
        templateUrl: 'modules/histories/client/views/form-history.client.view.html',
        controller: 'HistoriesController',
        controllerAs: 'vm',
        resolve: {
          historyResolve: newHistory
        },
        data: {
          roles: ['user', 'admin','guest'],
          pageTitle : 'Histories Create'
        }
      })
      .state('histories.edit', {
        url: '/:historyId/edit',
        templateUrl: 'modules/histories/client/views/form-history.client.view.html',
        controller: 'HistoriesController',
        controllerAs: 'vm',
        resolve: {
          historyResolve: getHistory
        },
        data: {
          roles: ['user', 'admin','guest'],
          pageTitle: 'Edit History {{ historyResolve.name }}'
        }
      })
      .state('histories.view', {
        url: '/:historyId',
        templateUrl: 'modules/histories/client/views/view-history.client.view.html',
        controller: 'HistoriesController',
        controllerAs: 'vm',
        resolve: {
          historyResolve: getHistory
        },
        data:{
          pageTitle: 'History {{ articleResolve.name }}'
        }
      });
  }

  getHistory.$inject = ['$stateParams', 'HistoriesService'];

  function getHistory($stateParams, HistoriesService) {
    return HistoriesService.get({
      historyId: $stateParams.historyId
    }).$promise;
  }

  newHistory.$inject = ['HistoriesService'];

  function newHistory(HistoriesService) {
    return new HistoriesService();
  }
})();
