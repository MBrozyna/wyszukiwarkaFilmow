'use strict';

describe('Films E2E Tests:', function () {
  describe('Test Films page', function () {
    it('Should report missing credentials', function () {
      browser.get('http://localhost:3001/films');
      expect(element.all(by.repeater('film in films')).count()).toEqual(0);
    });
  });
});
