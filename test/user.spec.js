/*
This is a Mocha and Chai test case for an endpoint in a server-side application that returns information about the currently authorized user.

The test case is organized into several blocks:

    The 'beforeEach' block is used to set up the test environment. It creates a new user and saves it to the database. Then it authenticates the user by making a POST request to the /api/authenticate endpoint with the user's email and password. The response from this request includes a JSON Web Token (JWT), which is stored in the token variable.

    The 'it' block defines the test case. It makes a GET request to the /api/user endpoint, passing the JWT in the Authorization header. The test case then asserts that the response has a status code of 200, that the response body is an object, that the status property of the response body is 'success', and that the data property of the response body has 'User Name', 'Followers', 'Following' properties.

    The 'after' block is used to clean up the test environment. It deletes the user that was created during the test case.

Overall, the test case is checking that the endpoint returns a successful response with the expected properties when a request is made to it by an authenticated user.

The test case is also cleaning up the created user after the test case is done.
*/

const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../server');
const app = require('../app');
const should = chai.should();

const User = require('../models/userModel');

chai.use(chaiHttp);

describe('Return the information of currently authorized user - GET /user', () => {
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

  it('Should get the current user', (done) => {
    chai
      .request(app)
      .get('/api/user')
      .set('Authorization', `Bearer ${token}`)
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.should.have.property('status').eql('success');
        res.body.data.should.have.property('User Name');
        res.body.data.should.have.property('Followers');
        res.body.data.should.have.property('Following');

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
