(function () {
  'use strict';

  angular
    .module('films')
    .run(menuConfig);

  menuConfig.$inject = ['Menus'];

  function menuConfig(Menus) {
    // Set top bar menu items
    Menus.addMenuItem('topbar', {
      title: 'Lista filmów',
      state: 'films.list',
      roles: ['*']
    });
    Menus.addMenuItem('topbar', {
      title: 'Scrapper',
      state: 'Scrapper',
      roles: ['admin']
    });


  }
})();
