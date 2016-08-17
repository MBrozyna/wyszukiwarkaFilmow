(function () {
  'use strict';

  angular
    .module('histories')
    .run(menuConfig);

  menuConfig.$inject = ['Menus'];

  function menuConfig(Menus) {
    // Set top bar menu items
    Menus.addMenuItem('topbar', {
      title: 'Historia',
      state: 'histories.list',
      roles: ['user', 'admin']
    });
  }
})();
