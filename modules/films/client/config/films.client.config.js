(function () {
  'use strict';

  angular
    .module('films')
    .run(menuConfig);

  menuConfig.$inject = ['Menus'];

  function menuConfig(Menus) {
    // Set top bar menu items
    Menus.addMenuItem('topbar', {
      title: 'Films',
      state: 'films',
      type: 'dropdown',
      roles: ['*']
    });

    // Add the dropdown list item
    Menus.addSubMenuItem('topbar', 'films', {
      title: 'List Films',
      state: 'films.list'
    });

    // Add the dropdown create item
    Menus.addSubMenuItem('topbar', 'films', {
      title: 'Create Film',
      state: 'films.create',
      roles: ['user']
    });
    Menus.addMenuItem('topbar', {
      title: 'Scrapper',
      state: 'Scrapper',
      roles: ['admin']
    });


  }
})();
