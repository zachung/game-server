const CollisionDetection = require('../../../../library/CollisionDetection')
const EasingFunctions = require('../../../../library/EasingFunctions')
const Vector = require('../../../../library/Vector')

class Ball {
  constructor(options) {
    const defaults = {
      x: 0,
      y: 0,
      width: 32,
      height: 32,
      color: "#e2543e",
      directRadians: 0,
      speed: 0,
      hp: 1,
      damage: 0,
      defence: 0,
      attackDistance: 0,
      listeners: {},
      faceDirectBits: 0b0000,
      mass: 1,
      punchForce: 0,
      friction: 0
    };
    const populated = Object.assign(defaults, options);
    for (const key in populated) {
      if (populated.hasOwnProperty(key)) {
        this[key] = populated[key];
      }
    }
    this.class = this.constructor.name;

    if (this.accelerate) {
      this.accelerate = new Vector(this.accelerate.x, this.accelerate.y);
    } else {
      this.accelerate = new Vector();
    }
  }
  get center() {
    return {
      x: this.x + (this.width || 0) / 2,
      y: this.y + (this.height || 0) / 2,
    };
  }
  faceTo(x, y) {
    this.directRadians = Math.atan2(y - this.y, x - this.x);
  }
  run(dt) {
    // this.accelerate.add(Vector.fromRadians(this.directRadians, this.speed * dt));
  }
  step(dt) {
    this.run(dt);
    // friction
    if (this.friction !== 0) {
      let friction = this.accelerate.clone().rotate(Math.PI).multiply(new Vector(this.friction, this.friction));
      this.accelerate.add(friction);
    }
    // dont move
    this.x += this.accelerate.x;
    this.y += this.accelerate.y;
    this.trigger('step', arguments);
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
  /**
   * Gets the damage.
   *
   * @param      {number}  damage  The damage
   * @return     {boolean}  still alive
   */
  getDamage(damage, dt) {
    this.hp -= Math.max(damage * dt - this.defence, 0);
    var isAlive = this.isAlive();
    if (!isAlive) {
      this.die();
    }
    return isAlive;
  }
  isAlive() {
    return this.hp > 0;
  }
  attack(other, dt = 1) {
    var isHitted = this.canAttack(other);
    if (isHitted) {
      other.getAttack(this, dt);
      this.getDamage(other.defence, dt);
    }
    return isHitted;
  }
  getAttack(other, dt) {
    let isAlive = this.getDamage(other.damage, dt);
    if (isAlive) {
      // punch
      other.punch(this);
    }
  }
  punch(other) {
    let angle = CollisionDetection.RectRectAngle(other, this);
    other.accelerate.add(
      Vector.fromRadians(angle, -this.punchForce)
    );
  }
  // can attack other
  canAttack(other) {
    if (this === other) {
      return false;
    }
    return CollisionDetection.RectRectDistance(this, other) <= this.attackDistance;
  }
  die() {
    this.trigger('die', arguments);
  }
  center() {
    return {
      x: this.x + this.width / 2,
      y: this.y + this.height / 2
    }
  }
  trigger(eventName, args) {
    if (this.listeners[eventName]) {
      for (const event of this.listeners[eventName]) {
        if (typeof event === "function") {
          event.apply(this, args);
        }
      }
    }
  }
  on(eventName, callback) {
    if (!this.listeners[eventName]) {
      this.listeners[eventName] = [];
    }
    this.listeners[eventName].push(callback);
  }
}

module.exports = Ball;