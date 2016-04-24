'use strict';

var should = require('should'),
  request = require('supertest'),
  path = require('path'),
  mongoose = require('mongoose'),
  User = mongoose.model('User'),
  Film = mongoose.model('Film'),
  express = require(path.resolve('./config/lib/express'));

/**
 * Globals
 */
var app, agent, credentials, user, film;

/**
 * Film routes tests
 */
describe('Film CRUD tests', function () {

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

    // Save a user to the test db and create new Film
    user.save(function () {
      film = {
        name: 'Film name'
      };

      done();
    });
  });

  it('should be able to save a Film if logged in', function (done) {
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

        // Save a new Film
        agent.post('/api/films')
          .send(film)
          .expect(200)
          .end(function (filmSaveErr, filmSaveRes) {
            // Handle Film save error
            if (filmSaveErr) {
              return done(filmSaveErr);
            }

            // Get a list of Films
            agent.get('/api/films')
              .end(function (filmsGetErr, filmsGetRes) {
                // Handle Film save error
                if (filmsGetErr) {
                  return done(filmsGetErr);
                }

                // Get Films list
                var films = filmsGetRes.body;

                // Set assertions
                (films[0].user._id).should.equal(userId);
                (films[0].name).should.match('Film name');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should not be able to save an Film if not logged in', function (done) {
    agent.post('/api/films')
      .send(film)
      .expect(403)
      .end(function (filmSaveErr, filmSaveRes) {
        // Call the assertion callback
        done(filmSaveErr);
      });
  });

  it('should not be able to save an Film if no name is provided', function (done) {
    // Invalidate name field
    film.name = '';

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

        // Save a new Film
        agent.post('/api/films')
          .send(film)
          .expect(400)
          .end(function (filmSaveErr, filmSaveRes) {
            // Set message assertion
            (filmSaveRes.body.message).should.match('Please fill Film name');

            // Handle Film save error
            done(filmSaveErr);
          });
      });
  });

  it('should be able to update an Film if signed in', function (done) {
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

        // Save a new Film
        agent.post('/api/films')
          .send(film)
          .expect(200)
          .end(function (filmSaveErr, filmSaveRes) {
            // Handle Film save error
            if (filmSaveErr) {
              return done(filmSaveErr);
            }

            // Update Film name
            film.name = 'WHY YOU GOTTA BE SO MEAN?';

            // Update an existing Film
            agent.put('/api/films/' + filmSaveRes.body._id)
              .send(film)
              .expect(200)
              .end(function (filmUpdateErr, filmUpdateRes) {
                // Handle Film update error
                if (filmUpdateErr) {
                  return done(filmUpdateErr);
                }

                // Set assertions
                (filmUpdateRes.body._id).should.equal(filmSaveRes.body._id);
                (filmUpdateRes.body.name).should.match('WHY YOU GOTTA BE SO MEAN?');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should be able to get a list of Films if not signed in', function (done) {
    // Create new Film model instance
    var filmObj = new Film(film);

    // Save the film
    filmObj.save(function () {
      // Request Films
      request(app).get('/api/films')
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Array).and.have.lengthOf(1);

          // Call the assertion callback
          done();
        });

    });
  });

  it('should be able to get a single Film if not signed in', function (done) {
    // Create new Film model instance
    var filmObj = new Film(film);

    // Save the Film
    filmObj.save(function () {
      request(app).get('/api/films/' + filmObj._id)
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Object).and.have.property('name', film.name);

          // Call the assertion callback
          done();
        });
    });
  });

  it('should return proper error for single Film with an invalid Id, if not signed in', function (done) {
    // test is not a valid mongoose Id
    request(app).get('/api/films/test')
      .end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('message', 'Film is invalid');

        // Call the assertion callback
        done();
      });
  });

  it('should return proper error for single Film which doesnt exist, if not signed in', function (done) {
    // This is a valid mongoose Id but a non-existent Film
    request(app).get('/api/films/559e9cd815f80b4c256a8f41')
      .end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('message', 'No Film with that identifier has been found');

        // Call the assertion callback
        done();
      });
  });

  it('should be able to delete an Film if signed in', function (done) {
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

        // Save a new Film
        agent.post('/api/films')
          .send(film)
          .expect(200)
          .end(function (filmSaveErr, filmSaveRes) {
            // Handle Film save error
            if (filmSaveErr) {
              return done(filmSaveErr);
            }

            // Delete an existing Film
            agent.delete('/api/films/' + filmSaveRes.body._id)
              .send(film)
              .expect(200)
              .end(function (filmDeleteErr, filmDeleteRes) {
                // Handle film error error
                if (filmDeleteErr) {
                  return done(filmDeleteErr);
                }

                // Set assertions
                (filmDeleteRes.body._id).should.equal(filmSaveRes.body._id);

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should not be able to delete an Film if not signed in', function (done) {
    // Set Film user
    film.user = user;

    // Create new Film model instance
    var filmObj = new Film(film);

    // Save the Film
    filmObj.save(function () {
      // Try deleting Film
      request(app).delete('/api/films/' + filmObj._id)
        .expect(403)
        .end(function (filmDeleteErr, filmDeleteRes) {
          // Set message assertion
          (filmDeleteRes.body.message).should.match('User is not authorized');

          // Handle Film error error
          done(filmDeleteErr);
        });

    });
  });

  it('should be able to get a single Film that has an orphaned user reference', function (done) {
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

          // Save a new Film
          agent.post('/api/films')
            .send(film)
            .expect(200)
            .end(function (filmSaveErr, filmSaveRes) {
              // Handle Film save error
              if (filmSaveErr) {
                return done(filmSaveErr);
              }

              // Set assertions on new Film
              (filmSaveRes.body.name).should.equal(film.name);
              should.exist(filmSaveRes.body.user);
              should.equal(filmSaveRes.body.user._id, orphanId);

              // force the Film to have an orphaned user reference
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

                    // Get the Film
                    agent.get('/api/films/' + filmSaveRes.body._id)
                      .expect(200)
                      .end(function (filmInfoErr, filmInfoRes) {
                        // Handle Film error
                        if (filmInfoErr) {
                          return done(filmInfoErr);
                        }

                        // Set assertions
                        (filmInfoRes.body._id).should.equal(filmSaveRes.body._id);
                        (filmInfoRes.body.name).should.equal(film.name);
                        should.equal(filmInfoRes.body.user, undefined);

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
      Film.remove().exec(done);
    });
  });
});
