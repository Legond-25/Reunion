/*
This is a Mocha and Chai unit test that tests the authentication feature of an application. 

The unit test defines three test cases:

    The first test case sends a POST request to the '/api/authenticate' endpoint with a valid email and password. The test case asserts that the response has a status of 200, that the response body is an object, and that the response body has a 'token' property and a 'status' property with the value 'success'.

    The second test case sends a POST request to the '/api/authenticate' endpoint with an incorrect email and password. The test case asserts that the response has a status of 401, that the response body is an object, and that the response body has a 'status' property with the value 'fail' and a 'message' property with the value 'Incorrect email or password'.

    The third test case sends a POST request to the '/api/authenticate' endpoint without providing either an email or a password. The test case asserts that the response has a status of 400, that the response body is an object, and that the response body has a 'status' property with the value 'fail' and a 'message' property with the value 'Please provide email and password'.

It is testing an API end point '/api/authenticate' for authentication of user.
It is testing for various scenarios like correct email and password, incorrect email and password and no email and password provided.

*/

const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../server');
const app = require('../app');
const expect = chai.expect;

chai.use(chaiHttp);

describe('Authenticate - POST /authenticate', function () {
  it('should return a token if email and password are correct', function (done) {
    chai
      .request(app)
      .post('/api/authenticate')
      .send({
        email: 'user_1@gmail.com',
        password: 'user_1@reunion',
      })
      .end(function (err, res) {
        expect(err).to.be.null;
        expect(res).to.have.status(200);
        expect(res.body).to.be.a('object');
        expect(res.body).to.have.property('token');
        expect(res.body).to.have.property('status').eql('success');

        done();
      });
  });

  it('should return a 401 error if email or password is incorrect', function (done) {
    chai
      .request(app)
      .post('/api/authenticate')
      .send({ email: 'test@example.com', password: 'wrongpassword' })
      .end(function (err, res) {
        expect(res).to.have.status(401);
        expect(res.body).to.be.a('object');
        expect(res.body).to.have.property('status').eql('fail');
        expect(res.body)
          .to.have.property('message')
          .eql('Incorrect email or password');

        done();
      });
  });

  it('should return a 400 error if email or password is not provided', function (done) {
    chai
      .request(app)
      .post('/api/authenticate')
      .send({ email: 'test@example.com' })
      .end(function (err, res) {
        expect(res).to.have.status(400);
        expect(res.body).to.be.a('object');
        expect(res.body).to.have.property('status').eql('fail');
        expect(res.body)
          .to.have.property('message')
          .eql('Please provide email and password');

        done();
      });
  });
});
