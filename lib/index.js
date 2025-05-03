class EventEmitter_ {
  constructor() {
    this._events = Object.create(null);
  }
  on(name, fn) {
    if (!this._events[name]) {
      this._events[name] = [];
    }
    this._events[name].push(fn);
    return this;
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
}
