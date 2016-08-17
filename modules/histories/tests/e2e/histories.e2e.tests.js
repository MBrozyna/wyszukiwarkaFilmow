'use strict';

describe('Histories E2E Tests:', function () {
  describe('Test Histories page', function () {
    it('Should report missing credentials', function () {
      browser.get('http://localhost:3001/histories');
      expect(element.all(by.repeater('history in histories')).count()).toEqual(0);
    });
  });
});
