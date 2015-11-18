'use strict';

var express = require('express');
var path = require('path');
var mongoose = require('mongoose');
var favicon = require('serve-favicon');

var Boom = require('boom');

var bodyParser = require('body-parser');
var errorHandler = require('errorhandler');

mongoose.Promise = require('bluebird');

/**
 * API keys
 */
var secrets = require('./server/config/secrets');

/**
 * Create Express server.
 */
var app = express();

/**
 * Connect to MongoDB.
 */
mongoose.connect(secrets.db);
mongoose.connection.on('error', function() {
  console.log('MongoDB Connection Error. Please make sure that MongoDB is running.');
  process.exit(1);
});

/**
 * Express configuration.
 */
app.set('port', process.env.PORT || 3000);
app.use(express.static(path.join(__dirname, 'public'), { maxAge: 31557600000 }));

app.use(favicon(path.join(__dirname, 'public/images', 'favicon.png')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.set('views', path.join(__dirname, 'public/jade'));
app.set('view engine', 'jade');


/**
 * App Locals
 * Default values for template variables
 */
app.locals.title = "Поезія Укрїни";

app.locals.ogUrl = new Date();
app.locals.ogType = "website";
app.locals.ogTitle = app.locals.title ;
app.locals.ogLocale = 'uk_UA';
app.locals.ogSitename = app.locals.title;
app.locals.ogDescription = "Ми мотивуємо віршами.";
app.locals.ogImage = "/images/fb-image.png";
app.locals.fbAppId = secrets.fb.appId;

app.use(function (req, res, next) {

  res.locals.ogUrl = req.protocol + '://' + req.get('host') + req.url;
  next();
});
/**
 * Views
 */

app.get('/', function (req, res) {
  res.render('index')
});
//
//app.get('/add', function (req, res) {
//  res.render('add', {
//    title: 'Додати'
//  });
//});

/**
 * API Authors
 */

var authorModel = require ('./server/models/Author');
app.get('/api/authors', function (req, res) {
  var query = {};
  if (req.query.name) {
    query = {
      name: { "$regex": req.query.name, "$options": "ig" }
    };
  }
  authorModel.find(query).then(function (resp) {
    res.json(resp.map(function (item) {
      return {
        id: item.id,
        name: item.name
      }
    }));
  });
});

var poemController = require ('./server/controllers/poem-controller');

app.get('/random', poemController.getRandomPoem);

app.get('/poem', poemController.getPoems);
app.get('/poem/:id', poemController.getPoemById);

app.get('/api/poems', poemController.api.getPoems);
app.get('/api/poems/:id', poemController.api.getPoemById);


/**
 * Error Handler.
 */
app.use(errorHandler());

/**
 * Start Express server.
 */
app.listen(app.get('port'), function() {
  console.log('Express server listening on port %d in %s mode', app.get('port'), app.get('env'));
});

module.exports = app;
