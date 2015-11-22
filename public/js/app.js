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
  API.getRandomPoemView = function () {
    return $.get('/random/view');
  };

  w.app.api = API;
})(window);
/**
 * Change poem without reloading page
 */
(function () {
  $(document).ready(function () {

    var $mainPoemEl = $('#mainPoem');

    function changePoem(poemObj) {
      $mainPoemEl.find('.poem__content').html(poemObj.content);
      $mainPoemEl.find('.poem__author').html(poemObj.author.name);
      $mainPoemEl.find('.poem__name').html(poemObj.name);
      document.title = poemObj.name;
    }

    window.app.showNext = function () {
      this.api.getRandomPoem().then(function (resp) {
        changePoem(resp);
        window.history.pushState({"type": "poem", "value": resp}, resp.name, '/poem/' + resp.id);
      });
    };
    window.onpopstate = function (e) {
      if (e.state.type == 'poem') {
        changePoem(e.state.value);
      }
    };
    $('.js-next-random-poem').on('click', function (e) {
      e.preventDefault();
      e.stopPropagation();

      window.app.showNext();
    });
    $(document).bind('keydown', 'Alt+right', function () {
      window.app.showNext();
    });
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
      window.open('http://www.facebook.com/share.php?u=' + location.origin, '_blank');
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
