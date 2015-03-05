(function($) {
  'use strict';

  /**
   * Callback on jquery-ujs ajax remote.
   * https://github.com/firelife/jquery-ujs-callback
   *
   * Requires jQuery 1.8.0 or later.
   *
   * Released under the MIT license
   */

  // jquery-ujs extend
  $.rails.href = function(element) {
    return element.attr('href') || element.data('url');
  };
  // element has attribate href/data-url
  $.fn.remote = function() {
    return this.each(function() {
      $.rails.handleRemote($(this));
    });
  }

  //--- render jquery plugin ---
  // not rails framework
  $.rails.needCSRFToken = true;
  // jquery plugin for form csrf token
  $.fn.fixCSRFToken = function() {
    this.filter('form').add(this.find('form')).each(function() {
      var $this = $(this),
        csrfToken = $('meta[name=csrf-token]').attr('content'),
        csrfParam = $('meta[name=csrf-param]').attr('content');
      if ($this.find('input[name="' + csrfParam + '"]').length === 0) {
        $this.prepend('<input name="' + csrfParam + '" value="' + csrfToken + '" type="hidden" />');
      } else {
        $this.find('input[name="' + csrfParam + '"]').val(csrfToken);
      }
    });
    return this;
  };

  //--- element component render ---
  // render component define by element attr
  var render = $.rails.render = {
    attr: "data-xtype",
    hooks: {},
    addHook: function(selector, widget) {
      render.hooks[selector] = widget;
      return render;
    }
  };
  // ui render on this element and children.
  $.fn.render = function() {
    var $this = $(this),
      $selector = "[" + render.attr + "]";

    // render by element define component
    $this.filter($selector).add($this.find($selector)).each(function() {
      var $el = $(this),
        widgets = $el.attr(render.attr).split(' ');
      $.each(widgets, function(i, widget) {
        if ($el[widget] && !$el.data(widget)) {
          $el[widget]($.extend({}, $el.data()));
        }
      });
    });

    // render default hook component
    $.each(render.hooks, function($selector, widget) {
      $this.filter($selector).add($this.find($selector)).each(function() {
        var $el = $(this);
        if ($.isFunction(widget)) {
          widget.call(this);
        } else if ($el[widget] && !$el.data(widget)) {
          $el[widget]($.extend({}, $el.data()));
        }
      });
    });

    // fix csrf token
    $.rails.needCSRFToken && this.fixCSRFToken();

    return this;
  }

  //--- timeout/interval ---
  // turbolinks need fix timeout/interval clear !!!
  var _timeouts = [],
    _intervals = [];

  // timeout
  $.fn.timeout = function() {
    return this.each(function() {
      var $this = $(this);
      _timeouts[_timeouts.length] = window.setTimeout(function() {
        $this.remote();
      }, $this.data('timeouts'));
    })
  };

  // interval
  $.fn.interval = function() {
    return this.each(function() {
      var $this = $(this);
      _intervals[_intervals.length] = window.setInterval(function() {
        $this.remote();
      }, $this.data('intervals'));
    })
  };

  //--- on document ready or turbolinks page:load ---
  $(function() {
    // clear timeout and interval
    _timeouts.forEach(function(t) {
      clearTimeout(t);
    });
    _intervals.forEach(function(t) {
      clearInterval(t);
    });
    _timeouts = [], _intervals = [];

    // render on dom ready
    setTimeout(function() {
      $('body').render();
    }, 1);
  });
})(jQuery);