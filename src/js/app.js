/**
 * Google Analytics
 *
 * Install script
 */
(function () {

  (function (i, s, o, g, r, a, m) {
    i['GoogleAnalyticsObject'] = r;
    i[r] = i[r] || function () {
        (i[r].q = i[r].q || []).push(arguments)
      }, i[r].l = 1 * new Date();
    a = s.createElement(o),
      m = s.getElementsByTagName(o)[0];
    a.async = 1;
    a.src = g;
    m.parentNode.insertBefore(a, m)
  })(window, document, 'script', '//www.google-analytics.com/analytics.js', 'ga');

  ga('create', 'UA-70339939-1', 'auto');
  ga('send', 'pageview');

})();

var app = app || {};
window.app = app;

/**
 * API
 */
(function (w) {
  var API = API || {};
  API.getRandomPoem = function () {
    return $.getJSON('/api/poems/random');
  };

  w.app.api = API;
})(window);


/**
 * jQuery History API
 */
(function () {
  window.onpopstate = function (e) {
    e.preventDefault();
    e.stopPropagation();
    //$(document).trigger('popstate', e.state || {});
  };
})();

/**
 * Change poem without reloading page
 */
(function () {
  $(document).ready(function () {
    console.log('document.ready');
    var $mainPoemEl = $('#mainPoem');

    function changePoem(poemObj) {
      document.title = poemObj.name;
      var html = poemObj.content.map(function (paragraph) {
        return '<p>' + paragraph.replace(RegExp("\n","g"),'<br>') + '</p>';
      }).join('');

      $mainPoemEl.children('.poem__content').html(html);
      $mainPoemEl.children('.poem__author').html(poemObj.author.name);
      $mainPoemEl.children('.poem__name').html(poemObj.name);
    }

    window.app.showNext = function () {
      this.api.getRandomPoem().then(function (resp) {
        changePoem(resp);
        window.history.pushState({
          "type": "poem",
          "value": resp
        }, resp.name, '/poem/' + resp.id);
      });
    };
    $('.js-next-random-poem').on('click', function (e) {
      e.preventDefault();
      e.stopPropagation();

      window.app.showNext();
    });
    $(document).bind('keydown', 'Alt+right', function () {
      window.app.showNext();
    });
    $(document).bind('keydown', 'Alt+left', function () {
      window.history.back();
    });
    $(window).bind('popstate', function (e) {

      var state = (e.originalEvent || {}).state || {};
      console.log('popstate', state);
      if (state.type =='poem') {
        changePoem(state.value);
      }
    })
  });
})();
/**
 * Share links from location and title
 */
(function () {
  $(document).ready(function () {
    /**
     * Share to Twitter
     * a.js-share-twitter(href="http://twitter.com/share?text=#{ogTitle}&url=#{ogUrl}", , target="_blank", title="Поділитися посиланням")
     */
    $('.js-share-twitter').on('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      window.open('http://twitter.com/share?text=' + document.title + '&url=' + location.origin, '_blank');
    });
    /**
     * Share to Facebook
     * a.js-share-fb(href="http://www.facebook.com/share.php?u=#{ogUrl}", target="_blank", title="Поділитися посиланням")
     */
    $('.js-share-fb').on('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      window.open('http://www.facebook.com/share.php?p[url]=' + location.origin + '&p[title]=' + document.title, '_blank');
    });
    /**
     * Share to Vkontakte
     * a.js-share-vk(href="http://vkontakte.ru/share.php?url=#{ogUrl}&title=#{ogTitle}", target="_blank", title="Поділитися посиланням")
     */
    $('.js-share-vk').on('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      window.open('http://vkontakte.ru/share.php?url=' + location.origin + '&title=' + document.title, '_blank');
    });
  })
})();
