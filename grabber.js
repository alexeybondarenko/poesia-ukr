var request = require("request-promise"),
  cheerio = require("cheerio"),
  Q = require("bluebird"),
  fs = Q.promisifyAll(require('fs')),
  ProgressBar = require('progress');

var authorsListPageUrl = 'http://onlyart.org.ua/?page_id=5026';

var mongoose = require('mongoose');
mongoose.Promise = Q;
var secrets = require('./server/config/secrets');
mongoose.connect(secrets.db);
mongoose.connection.on('error', function() {
  console.log('MongoDB Connection Error. Please make sure that MongoDB is running.');
  process.exit(1);
});


function getParamFromUrlQuery(name, url) {
  if (!url) url = location.href;
  name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
  var regexS = "[\\?&]" + name + "=([^&#]*)";
  var regex = new RegExp(regexS);
  var results = regex.exec(url);
  return results == null ? null : results[1];
}

function req(url) {
  return request({
    uri: url,
    transform: function (body) {
      return cheerio.load(body);
    }
  });
}

function getAuthorsPages(autorListPage) {
  return req(autorListPage).then(function ($) {
    var result = [];
    $('#posts li a').each(function (i, el) {
      var elem = $(el);
      var href = elem.attr('href');

      if (!href) return;
      result.push({
        id: parseInt(getParamFromUrlQuery('page_id', href)),
        name: elem.text(),
        url: href
      });
    });
    return result;
  });
}
function getPoemsPages(autorPageId) {
  return req('http://onlyart.org.ua/?page_id=' + autorPageId).then(function ($) {
    var result = [];
    $('#post-' + autorPageId + ' ul li a').each(function (i, el) {
      var elem = $(el);
      var href = elem.attr('href');
      if (!href) return;
      result.push({
        id: parseInt(getParamFromUrlQuery('page_id', href)),
        name: elem.text(),
        url: href
      });
    });
    return result;
  })
}
function getPoemPage(poemPageId) {
  return req('http://onlyart.org.ua/?page_id=' + poemPageId).then(function ($) {
    var result = [];
    $('#post-' + poemPageId + ' .entry p').each(function (i, el) {
      var elem = $(el);
      result.push(elem.text());
    });
    return result;
  })
}



function grabPoemsContentsByAuthorId(authorId) {
  return getPoemsPages(authorId).then(function (resp) {
    var poems = new ProgressBar('poems [:bar] :percent :etas', {
      width: 20,
      total: resp.length
    });
    return Q.map(resp, function (item) {
      return getPoemPage(item.id).then(function (result) {
        return {
          authorId: authorId,
          name: item.name,
          content: result
        };
      }).catch(function () {
        return null;
      }).finally(function () {
        poems.tick();
      })
    }, {
      concurrency: 5
    });
  }).then(function (resp) {
    return resp.filter(function (item) {
      return !!item;
    });
  })
}

function grabAuthor (authorId) {
  return grabPoemsContentsByAuthorId(authorId).then(function (res) {
    return fs.writeFileAsync('.tmp/poems-'+authorId+'.json', JSON.stringify(res, null, 4), {}).then(function () {
      return res;
    });
  });
}

var AuthorModel = require('./server/models/Author.js');
var PoemModel = require('./server/models/Poem.js');

function grabAuthors () {
  return getAuthorsPages(authorsListPageUrl).then(function (authors) {
    var authorsBar = new ProgressBar('authors [:bar] :percent :etas', {
      width: 20,
      total: authors.length
    });
    return Q.map(authors, function (item) {
      return grabAuthor(item.id).catch(function () {
        return null;
      }).finally(function () {
        authorsBar.tick();
      });
    }, {
      concurrency: 1
    });
  });
}

function saveAuthorsToMongo () {
  return getAuthorsPages (authorsListPageUrl).then(function (authors) {
    var authorsBar = new ProgressBar('authors [:bar] :percent :etas', {
      width: 20,
      total: authors.length
    });
    return Q.map(authors, function (author) {
      return (new AuthorModel({
        name: author.name
      })).save().then(function (resAuthor) {
        return fs.readFileAsync('.tmp/poems-' + author.id+'.json', 'utf-8').then(function (poems) {
          poems = JSON.parse(poems);
          return Q.map(poems, function (poem) {
            return (new PoemModel({
              author: resAuthor,
              name: poem.name,
              content: poem.content
            })).save();
          })
        }).catch(function () {
          console.log('error');
          return null;
        })
      }).finally(function () {
        authorsBar.tick();
      })
    })
  })
}

//saveAuthorsToMongo();
//grabAuthors();

//grabAuthorList ();
//grabAuthor(process.argv[2]);

//console.time("getPoemPage");
// 4940
//countPoems().then(function (result) {
//    console.log(result);
//    console.timeEnd("getPoemPage");
//});
// 14078.381ms
// 2  21261ms
// 3  17569ms
// 4  14916ms
// 5  13627ms 14571ms
// 6  14713ms
// 10 14043.007ms

//
//var testPoem = {
//  id: 11831,
//  name: '“На сіні, що срібліє над кущами…”',
//  url: 'http://onlyart.org.ua/?page_id=11831'
//};
//
//console.time("Page grabbing");
//var total = 300;
//var bar = new ProgressBar('parsing [:bar] :percent :etas', {
//  width: 20,
//  total: total
//});

//Q.map(Array(total), function () {
//    bar.tick();
//    return getPoemPage (testPoem.id)
//}, {
//    concurrency: 5
//}).then(function (resp) {
//    console.timeEnd("Page grabbing");
//});
// 100 - 19013.205ms = 190
// 300 - 56246.226ms = 187

// 529ms

// Avg 4940 * 19013 / 100 / 1000 = 932s = 15min
