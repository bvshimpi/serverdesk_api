var chai = require('chai');
var chaiHttp = require('chai-http');
chai.use(chaiHttp);
var expect = chai.expect;
var app = require('../app.js');
var token = "";

// In this test it's expected a task list of two tasks
describe('Unit test cases for User login apis', function() {
  it('Testing of Is Login api: Returns true on user is not login', function(done) {
    chai.request(app)
      .post('/isLogined')
      .set('auth', token)
      .end(function (err, res) {
        expect(err).to.be.null;
        expect(res.body.Status).to.have.equal(501);
        done();
    });
  });

  it('Testing of Login api: Returns true on login success', function(done) {
    chai.request(app)
      .post('/login')
      .send({ email: 'bvsram44@gmail.com', password: '123456' })
      .end(function (err, res) {
        expect(err).to.be.null;
        expect(res.body.Status).to.have.equal(200);
        token = res.body.Data.token;
        done();
    });
  });

  it('Testing of Is Login api: Returns true on user is logined', function(done) {
    chai.request(app)
      .post('/isLogined')
      .set('auth', token)
      .end(function (err, res) {
        expect(err).to.be.null;
        expect(res.body.Status).to.have.equal(200);
        done();
    });
  });
});

// In this test it's expected a task list of two tasks
describe('Unit test cases for Tickets apis', function() {
  var tid = "";
  var ticket_id = ""; 
  it('Testing of Ticket listing api: Returns true on if listed succesfully', function(done) {
    chai.request(app)
      .post('/getTickets')
      .set('auth', token)
      .end(function (err, res) {
        expect(err).to.be.null;
        expect(res.body.Status).to.have.equal(200);
        done();
    });
  });

  it('Testing of Ticket types api: Returns true on if types listed succesfully', function(done) {
    chai.request(app)
      .post('/getTicketTypes')
      .set('auth', token)
      .end(function (err, res) {
        expect(err).to.be.null;
        expect(res.body.Status).to.have.equal(200);
        done();
    });
  });

  
  it('Testing of Add/update Ticket api: Returns true on if added/updated succesfully', function(done) {
    var ticket_data = {
      "token": token, "title": 'test ticket', "description": 'test ticket description', "ticket_type": 1, "priority": "low", "contact_type": "email", "email": "bvs@test.com", "name": "bvs"
    }
    ticket_data = JSON.stringify(ticket_data);
    chai.request(app)
      .post('/addUpdateTicket')
      .set('auth', token)
      .send({ "ticket": ticket_data})
      .end(function (err, res) {
        expect(err).to.be.null;
        expect(res.body.Status).to.have.equal(200);
        done();
    });
  });

  it('Testing of Dashboard Ticket api: Returns true on if dashboard data got succesfully', function(done) {
    chai.request(app)
      .post('/getDashboardData')
      .set('auth', token)
      .end(function (err, res) {
        expect(err).to.be.null;
        expect(res.body.Status).to.have.equal(200);
        done();
    });
  });
});