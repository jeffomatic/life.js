// Simulation state class
function State(width, height, seeds, opts) {
  this.w = width;
  this.h = height;
  this.rules = {
    spawnAt: 3,
    killBelow: 2,
    killAbove: 3,
    toroidal: false
  };

  // Overwrite default rules, if necessary
  if (opts) {
    for (var k in this.rules) {
      if (opts[k] !== undefined) this.rules[k] = opts[k];
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

  // Build neighbor lists
  dirs = [[-1, 1], [0, 1], [1, 1], [-1, 0], [1, 0], [-1, -1], [0, -1], [1, -1]];

  for (var i = 0; i < this.h; ++i)
  for (var j = 0; j < this.w; ++j) {
    var cell = [j, i];
    this.neighborsOf[cell] = [];

    for (var d = 0; d < dirs.length; ++d) {
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

State.prototype.parthenogenerate = function(coord) {
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

State.prototype.adjustNeighborsOf = function(c, amount) {
  neighbors = this.neighborsOf[c];

  for (var i = 0; i < neighbors.length; ++i) {
    var n = neighbors[i];
    var count = (this.liveNeighborCount[n] || 0) + amount;

    if (count > 0) {
      this.liveNeighborCount[n] = count;
    } else {
      delete this.liveNeighborCount[n];
    }

    this.toExamine[n] = true;
  }
};

State.prototype.step = function() {
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
