var express = require('express');
var path = require('path');
var cors = require("cors");
var morgan = require('morgan');
var compression = require("compression");
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mysql = require('mysql');
var dbConnector = require('./modules/dbConnector');
var userRoutes = require("./routes/userRoutes");
var ticketRoutes = require("./routes/ticketRoutes");

var app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
var helmet = require('helmet');
var fs = require('fs');
var session = require('express-session')
var RateLimit = require('express-rate-limit');

var config = require('./config.js');
logger = require(path.resolve('./logger'))

app.enable('trust proxy'); // only if you're behind a reverse proxy (Heroku, Bluemix, AWS if you use an ELB, custom Nginx setup, etc) 

app.set('trust proxy', 1) // trust first proxy

app.use(session({
  secret: 'kuhnkfsdnkfnsdkfnsd',
  resave: true,
  saveUninitialized: true,
}))

app.use(helmet());
app.use(compression());

// view engine setup
app.set('view engine', 'pug');
app.set('views','./views');

// log only 4xx and 5xx responses to console
app.use(morgan('combined'))

// log all requests to access.log
app.use(morgan('common', {
  stream: fs.createWriteStream(path.join(__dirname, 'access.log'), { flags: 'a' })
}))

app.use(function(req, res, next) {
  // IE9 doesn't set headers for cross-domain ajax requests
  if(typeof(req.headers['content-type']) === 'undefined'){
    req.headers['content-type'] = "application/json; charset=UTF-8";
  }
  next();
})

app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(userRoutes);
app.use(ticketRoutes);

app.get('/', function (req, res, next) {
  res.render("index", {
    title: "Serverdesk"
  });
});

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  res.status(500);
  res.send("Page Not Found");
});


module.exports = app;


