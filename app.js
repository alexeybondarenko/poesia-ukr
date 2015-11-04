
var express = require('express'),
    path = require('path'),
    mongoose = require('mongoose');

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

var fixtures = require('pow-mongoose-fixtures');
/**
 * Fixtures
 */

//Directories (loads all files in the directory)
fixtures.load(__dirname + '/server/fixtures', mongoose.connection);


/**
 * Express configuration.
 */
app.set('port', process.env.PORT || 3000);
app.use(express.static(path.join(__dirname, 'src/static'), { maxAge: 31557600000 }));
app.use(express.static(path.join(__dirname, 'www'), { maxAge: 31557600000 }));

app.set('views', path.join(__dirname, 'src/jade'));
app.set('view engine', 'jade');

/**
 * Routes
 */

app.get('/', function (req, res) {
  res.render('view', {
    title: 'Головна'
  });
});
app.get('/poem/:poemId', function (req, res) {
  res.render('view', {
    title: 'Назва'
  })
});
app.get('/add', function (req, res) {
  res.render('add', {
    title: 'Додати'
  });
});

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

/**
 * Start Express server.
 */
app.listen(app.get('port'), function() {
  console.log('Express server listening on port %d in %s mode', app.get('port'), app.get('env'));
});

module.exports = app;
