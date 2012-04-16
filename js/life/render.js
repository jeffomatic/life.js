function render(elem, state, opts) {
  // Build rows, if necessary
  rows = $(elem).children('.row');

  if (rows.length < state.h) {
    var dy = state.h - rows.length;
    for (var i = 0; i < dy; ++i) {
      $(elem).append('<div class="row"></div>');
    }
  }

  // Process rows
  var rowId = 0;
  $(elem).children('.row').each(function() {
    // Invert the y position of the row for "intuitive" axes
    var rowY = state.h - 1 - rowId;

    // Ensure that we've got the correct number of cells
    cells = $(this).children('.cell');

    if (cells.length < state.w) {
      var dx = state.w - cells.length;
      for (var j = 0; j < dx; ++j) {
        var cell = document.createElement('div');
        $(cell).addClass('cell');

        if (opts && opts.cellDecorator) {
          opts.cellDecorator(cell, j, rowY);
        }

        $(this).append(cell);
      }
    }

    // Process cells
    var colId = 0;
    $(this).children('.cell').each(function() {
      var coord = [colId, rowY]; // for intuitive axes, invert the y-coord

      // Set the appropriate class for each cell
      classes = ['toKill', 'toSpawn', 'toExamine', 'justExamined', 'alive'];
      for (var i = 0; i < classes.length; ++i) {
        if (state[classes[i]][coord]) {
          $(this).addClass(classes[i]);
        } else {
          $(this).removeClass(classes[i]);
        }
      }

      ++colId;
    });

    ++rowId;
  });
}
