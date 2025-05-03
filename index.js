const EventEmitter_ = require("./lib/v2/event-emitter");

module.exports = {
  EventEmitter_,
  once: EventEmitter_.once,
  on: EventEmitter_.on,
  forward: EventEmitter_.forward,
  listenerCount: EventEmitter_.listenerCount,
};
