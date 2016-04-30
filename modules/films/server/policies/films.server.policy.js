'use strict';

/**
 * Module dependencies
 */
var acl = require('acl');

// Using the memory backend
acl = new acl(new acl.memoryBackend());

/**
 * Invoke Films Permissions
 */
exports.invokeRolesPolicies = function () {
  acl.allow([{
    roles: ['admin'],
    allows: [{
      resources: '/api/films',
      permissions: '*'
    }, {
      resources: '/api/films/:filmId',
      permissions: '*'
    }, {
      resource: '/api/scrapper',
      permission: ['get', 'post']
      }]
  }, {
    roles: ['user'],
    allows: [{
      resources: '/api/films',
      permissions: ['get', 'post']
    }, {
      resources: '/api/films/:filmId',
      permissions: ['get']
    }]
  }, {
    roles: ['guest'],
    allows: [{
      resources: '/api/films',
      permissions: ['get']
    }, {
      resources: '/api/films/:filmId',
      permissions: ['get']
    }]
  }]);
};

/**
 * Check If Films Policy Allows
 */
exports.isAllowed = function (req, res, next) {
  var roles = (req.user) ? req.user.roles : ['guest'];

  // If an Film is being processed and the current user created it then allow any manipulation
  if (req.film && req.user && req.film.user && req.film.user.id === req.user.id) {
    return next();
  }

  // Check for user roles
  acl.areAnyRolesAllowed(roles, req.route.path, req.method.toLowerCase(), function (err, isAllowed) {
    if (err) {
      // An authorization error occurred
      return res.status(500).send('Unexpected authorization error');
    } else {
      if (isAllowed) {
        // Access granted! Invoke next middleware
        return next();
      } else {
        return res.status(403).json({
          message: 'User is not authorized'
        });
      }
    }
  });
};
