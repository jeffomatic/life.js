// Simulation state class
var State = (function() {
  // List of cardinal and intermediate directions
  var dirs = {
    NW: [-1, 1],
    N: [0, 1],
    NE: [1, 1],
    W: [-1, 0],
    E: [1, 0],
    SW: [-1, -1],
    S: [0, -1],
    SE: [1, -1]
  };

  // Reverse lookup for direction names
  var dirNames = {};
  for (d in dirs) {
    dirNames[dirs[d]] = d;
  }

  // Utilities
  function getRealCoord(c) {
    if (c instanceof Array) return c;
    return _.map(c.split(','), function(n) { return parseInt(n); });
  }

  ////////////////////////
  // MODULE IMPLEMENTATION
  ////////////////////////

  var module = function(width, height, seeds, optRules) {
    this.w = width;
    this.h = height;
    this.rules = {
      spawnAt: 3,
      killBelow: 2,
      killAbove: 3,
      toroidal: false
    };

    // Overwrite default rules, if necessary
    if (optRules) {
      for (var k in this.rules) {
        if (optRules[k] !== undefined) this.rules[k] = optRules[k];
      }
    }

    // Simulation state
    this.alive = {};
    this.toExamine = {};
    this.justExamined = {};
    this.toKill = {};
    this.toSpawn = {};
    this.neighborsOf = {}
    this.liveNeighborCount = {};

    // For extra graphical tricks, let's keep precise state on live neighbors
    this.hasLiveNeighborAt = {};
    for (d in dirs) {
      this.hasLiveNeighborAt[d] = {};
    }

    // Build neighbor lists
    for (var i = 0; i < this.h; ++i)
    for (var j = 0; j < this.w; ++j) {
      var cell = [j, i];
      this.neighborsOf[cell] = [];

      for (d in dirs) {
        var x = j + dirs[d][0];
        var y = i + dirs[d][1];

        if (0 <= x && x < this.w &&
            0 <= y && y < this.h) {
          this.neighborsOf[cell].push([x, y]);
        }
      }
    }

    // Seed the simulation
    if (seeds) {
      for (var i = 0; i < seeds.length; ++i) {
        this.parthenogenerate(seeds[i]);
      }
    }
  }

  module.prototype.parthenogenerate = function(coord) {
    // Do nothing if the cell is already alive
    if (this.alive[coord] || this.toSpawn[coord]) {
      return;
    }

    // Insert into spawn set
    this.toSpawn[coord] = true;

    // Rescue from kill set if necessary
    delete this.toKill[coord];

    // Since are spontaneously creating this cell, we should examine it for
    // survival for the next frame
    this.toExamine[coord] = true;
  };

  module.prototype.adjustNeighborsOf = function(c, amount) {
    neighbors = this.neighborsOf[c];
    changedCellCoord = getRealCoord(c);

    for (var i = 0; i < neighbors.length; ++i) {
      var n = neighbors[i];
      var count = (this.liveNeighborCount[n] || 0) + amount;

      if (count > 0) {
        this.liveNeighborCount[n] = count;
      } else {
        delete this.liveNeighborCount[n];
      }

      this.toExamine[n] = true;

      // Determine the cardinal direction of the changing neighbor
      offset = [changedCellCoord[0] - n[0], changedCellCoord[1] - n[1]];
      dir = dirNames[offset];
      if (amount > 0) {
        this.hasLiveNeighborAt[dir][n] = true;
      } else if (amount < 0) {
        delete this.hasLiveNeighborAt[dir][n];
      }
    }
  };

  module.prototype.step = function() {
    // Execute pending kills
    for (var c in this.toKill) {
      delete this.alive[c];
      this.adjustNeighborsOf(c, -1);
    }

    this.toKill = {};

    // Execute pending spawns
    for (var c in this.toSpawn) {
      this.alive[c] = true;
      this.adjustNeighborsOf(c, 1);
    }

    this.toSpawn = {};

    // Determine which cells to kill/spawn for the next step
    this.justExamined = {};

    for (var c in this.toExamine) {
      var count = this.liveNeighborCount[c] || 0;

      if (this.alive[c]) {
        if (count < this.rules.killBelow || this.rules.killAbove < count) {
          this.toKill[c] = true;
        }
      } else {
        if (count === this.rules.spawnAt) {
          this.toSpawn[c] = true;
        }
      }

      this.justExamined[c] = true;
    }

    this.toExamine = {};
  };

  module.prototype.countList = function(list) {
    var i = 0;

    for (var c in this[list]) {
      if (this[list][c]) ++i;
    }

    return i;
  };

  module.prototype.allDead = function() {
    return this.countList('alive') == 0 && this.countList('toSpawn') == 0;
  };

  return module;
})();
