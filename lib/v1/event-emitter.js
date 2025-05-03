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
