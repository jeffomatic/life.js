var Pattern = (function() {
  var module = {
    offset: function(pattern) {
      var offset = [0, 0];

      if (arguments[1] instanceof Array) {
        offset = arguments[1];
      } else {
        if (arguments[1] !== undefined) offset[0] = arguments[1];
        if (arguments[2] !== undefined) offset[1] = arguments[2];
      }

      return _.map(pattern, function(c) {
        return [c[0] + offset[0], c[1] +offset[1]];
      });
    },
    reflectX: function(pattern, width) {
      return _.map(pattern, function(c) { return [width - c[0], c[1]]; });
    },
    reflectY: function(pattern, height) {
      return _.map(pattern, function(c) { return [c[0], height - c[1]]; });
    },
    reflect: function(pattern, width, height)  {
      return _.map(pattern, function(c) { return [width - c[0], height - c[1]]; });
    }
  };

  return module;
})();
