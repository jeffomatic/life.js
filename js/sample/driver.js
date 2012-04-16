/**
 * A. Predefined state
 *    [0] - State object
 *    [1] - options
 * B. Width/height and seeds
 *    [0] - width
 *    [1] - height
 *    [2] - seed pattern
 *    [3] - options
 */
function runSimulation() {
  var state = null;
  var opts = null;

  if (arguments[0] instanceof State) {
    state = arguments[0];
    opts = arguments[1];
  } else {
    state = new State(arguments[0], arguments[1], arguments[2], arguments[3]);
    opts = arguments[3];
  }

  // Driver configuration
  var config = {
    container: $('#life'),
    frameLength: 2000
  };

  // Overwrite defaults
  if (opts) {
    for (var k in config) {
      if (opts[k] !== undefined) config[k] = opts[k];
    }
  }

  // Render the initial state
  render(config.container, state, opts);

  // Simulation methods
  var stepCallbackHandle = null;

  function stepState() {
    state.step();
    render(config.container, state, opts);
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
      elem: config.container,
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
