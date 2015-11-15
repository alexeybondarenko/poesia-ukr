'use strict';

var mongoose = require('mongoose');
var fixtures = require('pow-mongoose-fixtures');

/**
 * API keys
 */
var secrets = require('./server/config/secrets');

mongoose.connect(secrets.db);
mongoose.connection.on('error', function() {
  console.log('MongoDB Connection Error. Please make sure that MongoDB is running.');
  process.exit(1);
});

/**
 * Fixtures
 */

//Directories (loads all files in the directory)
fixtures.load(__dirname + '/server/fixtures', mongoose.connection);

process.exit();
