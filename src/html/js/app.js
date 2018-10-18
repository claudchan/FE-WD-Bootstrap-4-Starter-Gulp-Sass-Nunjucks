// IIFE - Immediately Invoked Function Expression
(function (yourcode) {

  // The global jQuery object is passed as a parameter
  yourcode(window.jQuery, window, document);

}(function ($, window, document) {

  // The $ is now locally scoped 

  // Listen for the jQuery ready event on the document x
  $(function () {

    // The DOM is ready!

    plugin.cssUserAgent();
    plugin.init();

  });

  // The DOM may not be ready. The rest of the code goes here!

  window.plugin = function () {};

  $.extend(plugin, {
    cssUserAgent: function () {
      if (Modernizr) {
        $('html').addClass('modernizr');
      }
      if (cssua.ua.ie > 10.0) {
        $('html').addClass('gt-ie10');
      }
      if (cssua.ua.ie > 9.0) {
        $('html').addClass('gt-ie9');
      }
      if (cssua.ua.ie > 8.0) {
        $('html').addClass('gt-ie8');
      }
      if (cssua.ua.ie > 7.0) {
        $('html').addClass('gt-ie7');
      }
      if (cssua.ua.ie < 10.0) {
        $('html').addClass('lt-ie10');
      }
      if (cssua.ua.ie < 9.0) {
        $('html').addClass('lt-ie9');
        $('body').prepend('<div style="position:relative;color:#a94442;background-color:#f2dede;border-bottom:1px solid #a94442;padding:10px;text-align:center;"><p>It looks like you&rsquo;re using an insecure version of Internet Explorer. Using an outdated browser makes your computer unsafe. For the best experience on the web, please update your browser.</p><p><a href="http://browsehappy.com/?locale=en" style="font-weight:bold;display:inline-block;color:#fff;background-color:#a94442;padding:10px 20px;text-decoration:none;">Upgrade now!</a></p></div>');
      }
      if (cssua.ua.ie < 8.0) {
        $('html').addClass('lt-ie8');
      }
    },
    init: function () {
      $('footer').stickyFooter();
    }
  });

}));
