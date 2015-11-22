
var striptags = require('striptags');

var poemCollection = require ('../collections/poem-collection');
var secrets = require ('../config/secrets');

var poemController = {};

var emailSupport = 'support@example.com';

poemController.getPoems = function (req, res) {
  poemCollection.findByName(req.query.name).then(function (resp) {
    res.render('list', {
      title: 'Пошук',
      poems: resp
    });
  }, function () {
    res.render('error', {
      title: 'Помилка',
      errorMsg: 'Ми не знайшли вірш. Спробуйте ще раз'
    });
  });
};

function renderPoemView (res, poem) {
  res.render('view', {
    title: poem.name,
    poem: poem,
    ogTitle: poem.author.name +' - '+ poem.name,
    ogType: 'article',
    ogDescription: striptags(poem.content || '').substr(0, 255)
  });
}

poemController.getPoemById = function (req, res) {
  poemCollection.findById(req.params.id).then(function (poem) {
    renderPoemView (res, poem);
  }, function () {
    res.render('error', {
      title: 'Помилка',
      errorMsg: 'Ми не знайшли вірш. Спробуйте ще раз'
    });
  });
};


poemController.getRandomPoem = function (req, res) {
  poemCollection.findRandom().then(function (poem) {
    res.redirect('poem/'+poem.id);
  }, function () {
    res.render('error', {
      title: 'Помилка',
      errorMsg: 'Нам не вдалося знайти випадковий вірш. Бо всі вірші тут невипадково. :) Напишть нам. ' + secrets.support.email
    });
  });
};

poemController.api = {};
poemController.api.getPoems = function (req, res) {
  return poemCollection.findByName(req.query.name).catch(function () {
    return Boom.notFound('poems not found');
  }).then(function (resp) {
    res.json(resp);
  });
};
poemController.api.getPoemById = function (req, res) {
  return poemCollection.findById(req.params.id).catch(function () {
    return Boom.notFound('poem with id not found');
  }).then(function (resp) {
    res.json(resp);
  });
};
poemController.api.getPoemRandom = function (req, res) {
  return poemCollection.findRandom().catch(function (poem) {
    return Boom.notFound('random poem not found');
  }).then(function (resp) {
    res.json(resp);
  });
};

module.exports = poemController;
