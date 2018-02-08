const CollisionDetection = require('../../../../library/CollisionDetection')
const EasingFunctions = require('../../../../library/EasingFunctions')
const Vector = require('../../../../library/Vector')

let listeners = new WeakMap();

class Graphic {
  constructor(options) {
    const defaults = {
      x: 0,
      y: 0,
      width: 32,
      height: 32,
      color: "#00f"
    };
    const populated = Object.assign(defaults, options);
    for (const key in populated) {
      if (populated.hasOwnProperty(key)) {
        this[key] = populated[key];
      }
    }
    listeners.set(this, []);
  }
  trigger(eventName, ...args) {
    let selfEvent = this["on" + eventName.charAt(0).toUpperCase() + eventName.slice(1)];
    let selfEventProp = true;
    if (typeof selfEvent === "function") {
      selfEventProp = selfEvent.apply(this, args) !== false;
    }
    let events = listeners.get(this);
    if (!events[eventName]) {
      return selfEventProp;
    }
    // if self or other stop prop, then stop
    return selfEventProp && !events[eventName].some(event => false === event.apply(this, args));
  }
  on(eventName, callback) {
    if (typeof callback !== "function") {
      throw "callback must be a function";
    }
    let events = listeners.get(this);
    if (!events[eventName]) {
      events[eventName] = [];
    }
    events[eventName].push(callback);
    listeners.set(this, events);
    return this;
  }
  render(app, deltaPoint = { x: 0, y: 0 }) {
    app.layer
      .fillStyle(this.color)
      .fillRect(this.x + deltaPoint.x, this.y + deltaPoint.y, this.width, this.height);
  }
  renderImage(app, deltaPoint = { x: 0, y: 0 }) {
    app.layer.drawImage(app.images[this.image], this.x + deltaPoint.x, this.y + deltaPoint.y, this.width, this.height);
  }
  renderAtlas(app, deltaPoint = { x: 0, y: 0 }) {
    let atlas = app.atlases[this.atlases];
    let current = (app.lifetime % 2 / 2) * atlas.frames.length | 0;

    app.layer
      .save()
      .setTransform(1, 0, 0, 1, this.x + deltaPoint.x, this.y + deltaPoint.y)
      .drawAtlasFrame(atlas, current, 0, 0)
      .restore();
  }
  get center() {
    return {
      x: this.x + (this.width || 0) / 2,
      y: this.y + (this.height || 0) / 2,
    };
  }
  setCenter(x, y) {
    this.x = x - (this.width || 0) / 2;
    this.y = y - (this.height || 0) / 2;
  }
  step(dt) {
    this.trigger('step', dt);
  }
  static isInRect(point, rect) {
    return rect.x <= point.x &&
      rect.y <= point.y &&
      rect.x + rect.width >= point.x &&
      rect.y + rect.height >= point.y
  }
}

module.exports = Graphic;