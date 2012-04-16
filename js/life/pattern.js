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
      if (width === undefined) width = 0;
      return _.map(pattern, function(c) { return [width - c[0], c[1]]; });
    },

    reflectY: function(pattern, height) {
      if (height === undefined) height = 0;
      return _.map(pattern, function(c) { return [c[0], height - c[1]]; });
    },

    reflect: function(pattern, width, height)  {
      return _.map(pattern, function(c) { return [width - c[0], height - c[1]]; });
    },

    // assumes row-major matrices
    transform: function(pattern, matrix) {
      var size = matrix.length;
      if (size != 2 && size != 3) throw('Bad transform matrix');

      return _.map(pattern, function(p) {
        var r = [];

        for (var i = 0; i < size; ++i) {
          row = matrix[i];
          if (row.length != size) throw('Bad transform matrix');

          var t = 0;
          for (var j = 0; j < size; ++j) {
            t += (row[j] || 0) * (p[j] !== undefined ? p[j] : 1);
          }

          r.push(t);
        }

        return r;
      });
    },

    cw: function(pattern) {
      return module.transform(pattern, [[0, 1], [-1, 0]]);
    },

    ccw: function(pattern) {
      return module.transform(pattern, [[0, -1], [1, 0]]);
    },
  };

  return module;
})();
