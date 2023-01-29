/* 
This unit test is written in Mocha and Chai. The test case is checking the functionality of a route in an application that allows an authenticated user to create a new post.

The test case is organized into several blocks:

    In the 'beforeEach block', a new user is created, saved to the database, and authenticated by sending a login request to the server. The token returned from the login request is saved and the user's ID is saved in a variable.

    The 'it' block contains the test, which sends a request to the server to create a new post using the saved token and user ID. The test then checks that the response has a status of 201, and that the response body contains the expected properties and values for the post.

    The 'after' block is used to delete the test user from the database.
*/

const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../server');
const app = require('../app');
const should = chai.should();

const User = require('../models/userModel');

chai.use(chaiHttp);

describe('Create a post by authorized user - POST /createPost', () => {
  let token;
  let user;
  let id;

  beforeEach((done) => {
    user = new User({
      full_name: 'Test User',
      email: 'test@user.com',
      password: 'password',
      passwordConfirm: 'password',
    });

    user.save((err, user) => {
      if (err) {
        return done(err);
      }

      chai
        .request(app)
        .post('/api/authenticate')
        .send({
          email: 'test@user.com',
          password: 'password',
        })
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          token = res.body.token;
          id = user._id.toString();

          done();
        });
    });
  });

  it('It should create a new post by the authenticated user', (done) => {
    const post = {
      title: 'Test post',
      description: 'This is a test post',
      user: id,
    };

    chai
      .request(app)
      .post('/api/posts')
      .set('Authorization', `Bearer ${token}`)
      .send(post)
      .end((err, res) => {
        res.should.have.status(201);
        res.body.should.be.a('object');
        res.body.should.have.property('status').eql('success');
        res.body.should.have.property('data');
        res.body.data.should.have.property('user').eql(post.user);
        res.body.data.should.have.property('title').eql(post.title);
        res.body.data.should.have.property('description').eql(post.description);
        done();
      });
  });

  after((done) => {
    User.deleteOne({ email: 'test@user.com' }, (err) => {
      if (err) {
        return done(err);
      }
      done();
    });
  });
});
