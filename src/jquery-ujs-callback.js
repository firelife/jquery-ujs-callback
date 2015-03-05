(function($, undefined) {
  'use strict';

  /**
   * Callback on jquery-ujs ajax remote.
   * https://github.com/firelife/jquery-ujs-callback
   *
   * Requires jQuery 1.8.0 or later.
   *
   * Released under the MIT license
   */

  var masking, callback;

  // mask target element around remote call
  // masking.options to set mask options
  masking = $.rails.masking = {
    maskFn: 'mask',
    unmaskFn: 'unmask',
    mask: function(e) {
      if (e.target != this || !$(this)[masking.maskFn]) return;

      var $this = $(this),
        callback = $this.data('callback'),
        target = $this.data('target');
      switch (callback) {
        case 'replace':
        case 'replaceInner':
        case 'append':
        case 'prepend':
        case 'refresh':
        case 'refreshInner':
          target = $(target || this);
          break;
        case 'replaceParent':
          target = $(this).parent();
          break;
        case 'replaceClosest':
        case 'replaceClosestInner':
        case 'refreshClosest':
          target = $this.closest(target);
          break;
        default:
      }

      masking.options ? target[masking.maskFn](masking.options) : target[masking.maskFn]();

      // fix when e.target will be replaced
      if (target.find($(e.target)).length) {
        $(document).one('ajaxComplete', function() {
          target[masking.unmaskFn]();
        });
      }
    },
    unmask: function(e) {
      if (e.target != this || !$(this)[masking.unmaskFn]) return;

      var $this = $(this),
        callback = $this.data('callback'),
        target = $this.data('target');
      switch (callback) {
        case 'replace':
        case 'replaceInner':
        case 'append':
        case 'prepend':
        case 'refresh':
        case 'refreshInner':
          target = $(target || this);
          break;
        case 'replaceParent':
          target = $(this).parent();
          break;
        case 'replaceClosest':
        case 'replaceClosestInner':
        case 'refreshClosest':
          target = $this.closest(target);
          break;
        default:
      }
      target[masking.unmaskFn]();
    }
  };

  // render component after remote call success
  callback = $.rails.callback = {
    render: function($el) {
      $el.render();
    },
    // element data-callback = action:widget_name:widget_method
    // invoke target element widget method and args = data
    action: function(e, data) {
      var $this = $(this),
        $target = $($this.data('target') || this),
        method = $this.data('callback').split(':'),
        widget = $target.data(method[1]);
      if (method.length === 2) {
        $target[method[1]](data);
      } else if (method.length === 3) {
        (widget && widget[method[2]](data)) || $target[method[1]](method[2], data);
      }
    },
    replace: function(e, data) {
      var $this = $(this),
        $data = $(data);
      $($this.data('target') || this).replaceWith($data);
      callback.render($data);
    },
    replaceClosest: function(e, data) {
      var $this = $(this),
        $data = $(data);
      $this.closest($this.data('target')).replaceWith($data);
      callback.render($data);
    },
    replaceParent: function(e, data) {
      var $this = $(this),
        $data = $(data);
      $this.parent().replaceWith($data);
      callback.render($data);
    },
    replaceInner: function(e, data) {
      var $this = $(this),
        $data = $(data);
      $($this.data('target') || this).html($data);
      callback.render($data);
    },
    replaceClosestInner: function(e, data) {
      var $this = $(this),
        $data = $(data);
      $this.closest($this.data('target')).html($data);
      callback.render($data);
    },
    append: function(e, data) {
      var $this = $(this),
        $data = $(data);
      $($this.data('target') || this).append($data);
      callback.render($data);
    },
    prepend: function(e, data) {
      var $this = $(this),
        $data = $(data);
      $($this.data('target') || this).prepend($data);
      callback.render($data);
    },
    refresh: function(e) {
      $($(this).data('target')).each(function(index, el) {
        var $el = $(el),
          $data;
        $.getJSON($el.data('refresh-url'), function(e, data) {
          $el.replaceWith($data = $(data));
          callback.render($data);
        });
      });
    },
    refreshInner: function(e) {
      $($(this).data('target')).each(function(index, el) {
        var $el = $(el),
          $data;
        $.getJSON($el.data('refresh-url'), function(e, data) {
          $el.html($data = $(data));
          callback.render($data);
        });
      });
    },
    refreshClosest: function(e) {
      $(this).closest($(this).data('target')).each(function(index, el) {
        var $el = $(el),
          $data;
        $.getJSON($el.data('refresh-url'), function(e, data) {
          $el.replaceWith($data = $(data));
          callback.render($data);
        });
      });
    },
    clear: function(e) {
      $($(this).data('clear')).empty();
    },
    remove: function(e) {
      $($(this).data('remove')).remove();
    },
    clearClosest: function(e) {
      $(this).closest($(this).data('clear-closest')).empty();
    },
    removeClosest: function(e) {
      $(this).closest($(this).data('remove-closest')).remove();
    },
    json: function(e, data) {
      if (e.target != this) return;

      if (data.location) {
        window.location.href = data.location;
        return false;
      }
      if (data.fragments) {
        $.each(data.fragments, function(i, s) {
          var $el = $(i),
            $data = $(s);
          $el.replaceWith($data);
          callback.render($data);
        });
      }
      if (data['inner-fragments']) {
        $.each(data['inner-fragments'], function(i, s) {
          var $el = $(i),
            $data = $(s);
          $el.html($data);
          callback.render($data);
        });
      }
      if (data['append-fragments']) {
        $.each(data['append-fragments'], function(i, s) {
          var $el = $(i),
            $data = $(s);
          $el.append($data);
          callback.render($data);
        });
      }
      if (data['prepend-fragments']) {
        $.each(data['prepend-fragments'], function(i, s) {
          var $el = $(i),
            $data = $(s);
          $el.prepend($data);
          callback.render($data);
        });
      }
    },
    callback: function(e, data) {
      if (e.target != this) return;

      callback[$(this).data('callback').split(':')[0]].apply(this, arguments);
    }
  };

  // bind ajax event
  $(document)
    .on('ajax:before', '[data-callback]:not([nomask])', masking.mask)
    .on('ajax:complete', '[data-callback]:not([nomask])', masking.unmask)
    .on('ajax:success', '[data-callback]', callback.callback)
    .on('ajax:success', ':not([data-callback])', callback.json);
})(jQuery);