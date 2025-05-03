class EventEmitter_ {
  constructor() {
    this._events = Object.create(null);
    this._maxListeners = EventEmitter_.defaultMaxListeners;
  }
  on(name, fn) {
    if (!this._events[name]) {
      this._events[name] = [];
    }
    this._events[name].push(fn);
    return this;
  }
  once(name, fn) {
    const wrapper = (...args) => {
      this.off(name, wrapper);
      fn(...args);
    };
    wrapper.listener = fn;
    this.on(name, wrapper);
    return this;
  }
  off(name, fn) {
    const listeners = this._events[name];
    if (!listeners) {
      return this;
    }
    const ind = listeners.indexOf(fn);
    if (ind === -1) {
      for (let i = 0; i < listeners.length; i++) {
        if (listeners[i].listener === fn) {
          listeners.splice(i, 1);
          break;
        }
      }
    } else {
      listeners.splice(ind, 1);
    }

    if (listeners.length === 0) {
      delete this._events[name];
    }
    return this;
  }

  removeAllListeners(name) {
    if (name === undefined) {
      this._events = Object.create(null);
    } else {
      delete this._events[name];
    }
    return this;
  }
  listeners(name) {
    return this._events[name] ? [...this._events[name]] : [];
  }
  listenerCount(name) {
    return this.listeners(name).length;
  }
  emit(name, ...args) {
    const listeners = this._events[name];
    if (!listeners || listeners.length === 0) {
      return false;
    }
    for (const listener of listeners) {
      listener(...args);
    }
    return true;
  }
  prependListener(name, fn) {
    if (!this._events[name]) {
      this._events[name] = [];
    }
    this._events[name].unshift(fn);
    return this;
  }
  prependOnceListener(name, fn) {
    const wrapper = (...args) => {
      this.off(name, wrapper);
      fn(...args);
    };

    wrapper.listener = fn;
    this.prependListener(name, wrapper);
    return this;
  }
  setMaxListener(n) {
    this._maxListeners = n;
  }
  getMaxListeners() {
    return this._maxListeners;
  }
}

EventEmitter_.defaultMaxListeners = 10;

EventEmitter_.on = function on(emitter, name, opts = {}) {
  const { signal } = opts;
  if (signal?.aborted) {
    return Promise.reject(new Error("operation aborted"));
  }
  let error = null;
  let done = false;
  const queue = [];
  const pending = [];

  function onEvent(...args) {
    if (pending.length) {
      pending.shift().resolve({ value: args, done: false });
    } else {
      queue.push(args);
    }
  }

  function onError(err) {
    if (pending.length) {
      pending.shift().reject(err);
    } else {
      error = err;
    }
  }
  function onAbort() {
    cleanup();
    onError(new Error("Abort Error"));
  }

  function cleanup() {
    emitter.off(name, onEvent);
    if (name !== "error") {
      emitter.off("error", onError);
    }
    if (signal) {
      signal.removeEventListener("abort", onAbort);
    }
    done = true;
  }
  emitter.on(name, onEvent);
  if (name !== "error") {
    emitter.on("error", onError);
  }
  if (signal) {
    signal.addEventListener("abort", onAbort);
  }

  return {
    async next() {
      if (queue.length) {
        return {
          value: queue.shift(),
          done: false,
        };
      }
      if (error) {
        throw error;
      }
      if (done) {
        return {
          value: undefined,
          done: true,
        };
      }
      return new Promise((resolve, reject) =>
        pending.push({ resolve, reject })
      );
    },
    return() {
      cleanup();
      return Promise.resolve({ done: true });
    },
    throw(err) {
      cleanup();
      return Promise.reject(err);
    },
    [Symbol.asyncIterator]() {
      return this;
    },
  };
};

EventEmitter_.once = function once(emitter, name, opts = {}) {
  const { signal } = opts;
  if (signal?.aborted) {
    return Promise.reject(new Error("operation aborted"));
  }
  return new Promise((resolve, reject) => {
    function handler(...args) {
      cleanup();
      resolve(args);
    }

    function onAbort() {
      cleanup();
      reject(new Error("Abort Error"));
    }

    function onError(err) {
      cleanup();
      reject(err);
    }

    function cleanup() {
      emitter.off(name, handler);
      if (name !== "error") {
        emitter.off("error", onError);
      }
      if (signal) {
        signal.removeEventListener("abort", onAbort);
      }
    }

    emitter.once(name, handler);
    if (name !== "error") emitter.once("error", onError);
    if (signal) signal.addEventListener("abort", onAbort);
  });
};

module.exports = EventEmitter_;
