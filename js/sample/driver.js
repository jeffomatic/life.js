function runSimulation(width, height, seeds, opts) {
  var config = {
    elem: $('#life'),
    frameLength: 2000
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

  function pauseToggle() {
    if (stepCallbackHandle) {
      pause();
    } else {
      unpause();
    }
  }

  function stepTrigger() {
    if (stepCallbackHandle) return; // don't advance if the simulation isn't paused
    stepState();
  }

  // Create event lookup table
  eventsTable = {
    keydown: {
      elem: window,
      paramEvents: {
        32: pauseToggle // spacebar
      }
    },
    click: {
      elem: config.elem,
      paramEvents: {
        1: stepTrigger, // left click
        2: pauseToggle // middle click
      }
    }
  };

  // Install event listeners. I really should've written this in CoffeeScript...
  for (var eventType in eventsTable) {
    (function(_eventType) {
      var elem = eventsTable[_eventType].elem;
      var paramEvents = eventsTable[_eventType].paramEvents;

      for (var param in paramEvents) {
        (function(_param, _eventType) {
          $(elem)[_eventType](function(event) {
            if (event.which.toString() == _param.toString()) {
              paramEvents[_param]();
            }
          });
        })(param, eventType);
      }
    })(eventType);
  }

  // Start framerate-based simulation
  if (config.frameLength > 0) {
    unpause();
  }
}
