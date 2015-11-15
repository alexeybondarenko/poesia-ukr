
var mongoose = require('mongoose');

var poemSchema = new mongoose.Schema({
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'Author' },
  name: String,
  content: String
});

module.exports = mongoose.model('Poem', poemSchema);
