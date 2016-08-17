'use strict';

/**
 * Module dependencies
 */
var historiesPolicy = require('../policies/histories.server.policy'),
  histories = require('../controllers/histories.server.controller');

module.exports = function(app) {
  // Histories Routes
  app.route('/api/histories')/*.all(historiesPolicy.isAllowed)*/
    .get(histories.list)
    .post(histories.create);

  app.route('/api/histories/:historyId').all(historiesPolicy.isAllowed)
    .get(histories.read)
    .put(histories.update)
    .delete(histories.delete);

  // Finish by binding the History middleware
  app.param('historyId', histories.historyByID);
};
