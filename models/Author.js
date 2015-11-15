
var mongoose = require('mongoose');

var authorSchema = new mongoose.Schema({
  name: String
});

module.exports = mongoose.model('Author', authorSchema);
