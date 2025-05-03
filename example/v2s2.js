const { EventEmitter_ } = require("../index");

const emitter = new EventEmitter_();

emitter.on("greet", (name) => {
  console.log("my name is ", name);
});

emitter.once("oneTime", (name) => {
  console.log("my name is ", name);
});

emitter.emit("greet", "sidhart");

emitter.emit("oneTime", "navneet");
emitter.emit("oneTime", "navneet");
