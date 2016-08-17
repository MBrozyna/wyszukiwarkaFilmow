'use strict';

var should = require('should'),
  request = require('supertest'),
  path = require('path'),
  mongoose = require('mongoose'),
  User = mongoose.model('User'),
  History = mongoose.model('History'),
  express = require(path.resolve('./config/lib/express'));

/**
 * Globals
 */
var app, agent, credentials, user, history;

/**
 * History routes tests
 */
describe('History CRUD tests', function () {

  before(function (done) {
    // Get application
    app = express.init(mongoose);
    agent = request.agent(app);

    done();
  });

  beforeEach(function (done) {
    // Create user credentials
    credentials = {
      username: 'username',
      password: 'M3@n.jsI$Aw3$0m3'
    };

    // Create a new user
    user = new User({
      firstName: 'Full',
      lastName: 'Name',
      displayName: 'Full Name',
      email: 'test@test.com',
      username: credentials.username,
      password: credentials.password,
      provider: 'local'
    });

    // Save a user to the test db and create new History
    user.save(function () {
      history = {
        name: 'History name'
      };

      done();
    });
  });

  it('should be able to save a History if logged in', function (done) {
    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        // Get the userId
        var userId = user.id;

        // Save a new History
        agent.post('/api/histories')
          .send(history)
          .expect(200)
          .end(function (historySaveErr, historySaveRes) {
            // Handle History save error
            if (historySaveErr) {
              return done(historySaveErr);
            }

            // Get a list of Histories
            agent.get('/api/histories')
              .end(function (historysGetErr, historysGetRes) {
                // Handle History save error
                if (historysGetErr) {
                  return done(historysGetErr);
                }

                // Get Histories list
                var histories = historiesGetRes.body;

                // Set assertions
                (histories[0].user._id).should.equal(userId);
                (histories[0].name).should.match('History name');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should not be able to save an History if not logged in', function (done) {
    agent.post('/api/histories')
      .send(history)
      .expect(403)
      .end(function (historySaveErr, historySaveRes) {
        // Call the assertion callback
        done(historySaveErr);
      });
  });

  it('should not be able to save an History if no name is provided', function (done) {
    // Invalidate name field
    history.name = '';

    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        // Get the userId
        var userId = user.id;

        // Save a new History
        agent.post('/api/histories')
          .send(history)
          .expect(400)
          .end(function (historySaveErr, historySaveRes) {
            // Set message assertion
            (historySaveRes.body.message).should.match('Please fill History name');

            // Handle History save error
            done(historySaveErr);
          });
      });
  });

  it('should be able to update an History if signed in', function (done) {
    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        // Get the userId
        var userId = user.id;

        // Save a new History
        agent.post('/api/histories')
          .send(history)
          .expect(200)
          .end(function (historySaveErr, historySaveRes) {
            // Handle History save error
            if (historySaveErr) {
              return done(historySaveErr);
            }

            // Update History name
            history.name = 'WHY YOU GOTTA BE SO MEAN?';

            // Update an existing History
            agent.put('/api/histories/' + historySaveRes.body._id)
              .send(history)
              .expect(200)
              .end(function (historyUpdateErr, historyUpdateRes) {
                // Handle History update error
                if (historyUpdateErr) {
                  return done(historyUpdateErr);
                }

                // Set assertions
                (historyUpdateRes.body._id).should.equal(historySaveRes.body._id);
                (historyUpdateRes.body.name).should.match('WHY YOU GOTTA BE SO MEAN?');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should be able to get a list of Histories if not signed in', function (done) {
    var historyObj = new History(history);

    // Save the history
    historyObj.save(function () {
      // Request Histories
      request(app).get('/api/histories')
        .end(function (req, res) {
          res.body.should.be.instanceof(Array).and.have.lengthOf(1);

          done();
        });

    });
  });

  it('should be able to get a single History if not signed in', function (done) {
    // Create new History model instance
    var historyObj = new History(history);

    // Save the History
    historyObj.save(function () {
      request(app).get('/api/histories/' + historyObj._id)
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Object).and.have.property('name', history.name);

          // Call the assertion callback
          done();
        });
    });
  });

  it('should return proper error for single History with an invalid Id, if not signed in', function (done) {
    // test is not a valid mongoose Id
    request(app).get('/api/histories/test')
      .end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('message', 'History is invalid');

        // Call the assertion callback
        done();
      });
  });

  it('should return proper error for single History which doesnt exist, if not signed in', function (done) {
    // This is a valid mongoose Id but a non-existent History
    request(app).get('/api/histories/559e9cd815f80b4c256a8f41')
      .end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('message', 'No History with that identifier has been found');

        // Call the assertion callback
        done();
      });
  });

  it('should be able to delete an History if signed in', function (done) {
    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        // Get the userId
        var userId = user.id;

        // Save a new History
        agent.post('/api/histories')
          .send(history)
          .expect(200)
          .end(function (historySaveErr, historySaveRes) {
            // Handle History save error
            if (historySaveErr) {
              return done(historySaveErr);
            }

            // Delete an existing History
            agent.delete('/api/histories/' + historySaveRes.body._id)
              .send(history)
              .expect(200)
              .end(function (historyDeleteErr, historyDeleteRes) {
                // Handle history error error
                if (historyDeleteErr) {
                  return done(historyDeleteErr);
                }

                // Set assertions
                (historyDeleteRes.body._id).should.equal(historySaveRes.body._id);

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should not be able to delete an History if not signed in', function (done) {
    // Set History user
    history.user = user;

    // Create new History model instance
    var historyObj = new History(history);

    // Save the History
    historyObj.save(function () {
      // Try deleting History
      request(app).delete('/api/histories/' + historyObj._id)
        .expect(403)
        .end(function (historyDeleteErr, historyDeleteRes) {
          // Set message assertion
          (historyDeleteRes.body.message).should.match('User is not authorized');

          // Handle History error error
          done(historyDeleteErr);
        });

    });
  });

  it('should be able to get a single History that has an orphaned user reference', function (done) {
    // Create orphan user creds
    var _creds = {
      username: 'orphan',
      password: 'M3@n.jsI$Aw3$0m3'
    };

    // Create orphan user
    var _orphan = new User({
      firstName: 'Full',
      lastName: 'Name',
      displayName: 'Full Name',
      email: 'orphan@test.com',
      username: _creds.username,
      password: _creds.password,
      provider: 'local'
    });

    _orphan.save(function (err, orphan) {
      // Handle save error
      if (err) {
        return done(err);
      }

      agent.post('/api/auth/signin')
        .send(_creds)
        .expect(200)
        .end(function (signinErr, signinRes) {
          // Handle signin error
          if (signinErr) {
            return done(signinErr);
          }

          // Get the userId
          var orphanId = orphan._id;

          // Save a new History
          agent.post('/api/histories')
            .send(history)
            .expect(200)
            .end(function (historySaveErr, historySaveRes) {
              // Handle History save error
              if (historySaveErr) {
                return done(historySaveErr);
              }

              // Set assertions on new History
              (historySaveRes.body.name).should.equal(history.name);
              should.exist(historySaveRes.body.user);
              should.equal(historySaveRes.body.user._id, orphanId);

              // force the History to have an orphaned user reference
              orphan.remove(function () {
                // now signin with valid user
                agent.post('/api/auth/signin')
                  .send(credentials)
                  .expect(200)
                  .end(function (err, res) {
                    // Handle signin error
                    if (err) {
                      return done(err);
                    }

                    // Get the History
                    agent.get('/api/histories/' + historySaveRes.body._id)
                      .expect(200)
                      .end(function (historyInfoErr, historyInfoRes) {
                        // Handle History error
                        if (historyInfoErr) {
                          return done(historyInfoErr);
                        }

                        // Set assertions
                        (historyInfoRes.body._id).should.equal(historySaveRes.body._id);
                        (historyInfoRes.body.name).should.equal(history.name);
                        should.equal(historyInfoRes.body.user, undefined);

                        // Call the assertion callback
                        done();
                      });
                  });
              });
            });
        });
    });
  });

  afterEach(function (done) {
    User.remove().exec(function () {
      History.remove().exec(done);
    });
  });
});
