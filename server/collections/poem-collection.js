/**
 * Created by alexeybondarenko on 11/5/15.
 */

var poemModel = require ('../models/Poem');

var poemCollection = {};
poemCollection.poemToJson = function (poem) {
  return {
    id: poem.id,
    name: poem.name,
    content: poem.content,
    author: {
      id: poem.author.id,
      name: poem.author.name
    }
  };
};
poemCollection.findById = function (id) {
  return poemModel.findById(id).populate('author').exec().then(function (resp) {
    return this.poemToJson (resp);
  }.bind(this));
};
poemCollection.findByName = function (name) {
  var query = {};
  if (name) {
    query = {
      name: { "$regex": name, "$options": "ig" }
    };
  }
  var self = this;
  return poemModel.find(query).populate('author').exec().then(function (resp) {
    return resp.map(function (poem) {
      return self.poemToJson(poem);
    });
  });
};
poemCollection.findRandom = function () {
  return poemModel.count().exec().then(function (count) {
    var rand = Math.floor(Math.random() * count);
    return poemModel.findOne().skip(rand).exec();
  }).then(function (poem) {
    return this.poemToJson (poem);
  }.bind(this));
};

module.exports = poemCollection;
