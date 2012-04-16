function runSimulation(width, height, seeds, opts) {
  var config = {
    elem: $('#life'),
    frameLength: 2000,
    stepKey: [39, 40], // right arrow, down arrow
    pauseKey: 32, // spacebar
  };

  // Overwrite defaults
  if (opts) {
    for (var k in config) {
      if (opts[k] !== undefined) config[k] = opts[k];
    }
  }

  // Make sure our key options are arrays
  keyOpts = ['stepKey', 'pauseKey'];
  for (var i = 0; i < keyOpts.length; ++i ) {
    var k = keyOpts[i];
    if (config[k] && !(config[k] instanceof Array)) config[k] = [config[k]];
  }

  // Create state
  var state = new State(width, height, seeds, opts);

  // Render the initial state
  render(config.elem, state, opts);

  // Simulation methods
  var stepCallbackHandle = null;

  function stepState() {
    state.step();
    render(config.elem, state, opts);
  }

  function pause() {
    clearInterval(stepCallbackHandle);
    stepCallbackHandle = null;
  }

  function unpause() {
    stepCallbackHandle = setInterval(stepState, config.frameLength);
  }

  // Setup keyboard callback table
  var keyConfigCallbacks = {
    pauseKey: function() {
      if (stepCallbackHandle) {
        pause();
      } else {
        unpause();
      }
    },
    stepKey: function() {
      if (stepCallbackHandle) return; // don't step unless we're pused
      stepState();
    }
  };

  var keyCallbacks = {};

  for (var keyConfig in keyConfigCallbacks) {
    if (config[keyConfig]) {
      for (var i = 0; i < config[keyConfig].length; ++i) {
        keyCallbacks[config[keyConfig][i]] = keyConfigCallbacks[keyConfig];
      }
    }
  }

  // Install keyboard callback
  $(window).keydown(function(event) {
    var callback = keyCallbacks[event.which];
    if (callback) callback();
  });

  // Start framerate-based simulation
  if (config.frameLength > 0) {
    unpause();
  }
}
