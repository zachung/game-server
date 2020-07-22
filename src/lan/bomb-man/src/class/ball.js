const CollisionDetection = require('../collision')
const easeOutQuad = function (t, b, c, d) {
  t /= d
  return -c * t * (t - 2) + b
}

var collisionDetection = new CollisionDetection()

class Ball {
  constructor (options) {
    const defaults = {
      x: 0,
      y: 0,
      width: 32,
      height: 32,
      color: '#e2543e',
      directRadians: 0,
      speed: 0,
      dt: 0,
      hp: 1,
      damage: 0,
      defence: 0,
      attackDistance: 0,
      listeners: {},
      faceDirectBits: 0b0000
    }
    const populated = Object.assign(defaults, options)
    for (const key in populated) {
      if (populated.hasOwnProperty(key)) {
        this[key] = populated[key]
      }
    }
  }
  faceTo (x, y) {
    this.directRadians = Math.atan2(y - this.y, x - this.x)
  }
  getMoveVector (dt) {
    var x = 0,
      y = 0,
      maxDt = 0.5 // from 0 to this.speed's time

    x -= (this.faceDirectBits >> 3) & 1 // L
    x += (this.faceDirectBits >> 2) & 1 // R
    y -= (this.faceDirectBits >> 1) & 1 // U
    y += (this.faceDirectBits >> 0) & 1 // D
    var ease = easeOutQuad(this.dt, 0, this.speed * dt, maxDt)
    return {
      dx: ease * x,
      dy: ease * y
    }
  }
  _step (dt) {
    var x = 0,
      y = 0,
      maxDt = 0.5 // from 0 to this.speed's time

    x -= (this.faceDirectBits >> 3) & 1 // L
    x += (this.faceDirectBits >> 2) & 1 // R
    y -= (this.faceDirectBits >> 1) & 1 // U
    y += (this.faceDirectBits >> 0) & 1 // D
    // acceleration
    if (x !== 0 || y !== 0) {
      this.dt += dt
      this.dt = Math.min(this.dt, maxDt)
    } else {
      this.dt -= dt
      this.dt = Math.max(this.dt, 0)
    }
  }
  step (dt) {
    this._step(dt)
    var vector = this.getMoveVector(dt)
    // dont move
    this.x += vector.dx
    this.y += vector.dy
    this.trigger('step', arguments)
  }
  render (app, deltaPoint = { x: 0, y: 0 }) {
    app.layer
      .fillStyle(this.color)
      .fillRect(this.x + deltaPoint.x, this.y + deltaPoint.y, this.width, this.height)
  }
  renderImage (app, deltaPoint = { x: 0, y: 0 }) {
    app.layer.drawImage(app.images[this.image], this.x + deltaPoint.x, this.y + deltaPoint.y, this.width, this.height)
  }
  /**
   * Gets the damage.
   *
   * @param      {number}  damage  The damage
   * @return     {boolean}  still alive
   */
  getDamage (damage, dt) {
    this.hp -= Math.max(damage * dt - this.defence, 0)
    var isAlive = this.hp > 0
    if (!isAlive) {
      this.die()
    }
    return isAlive
  }
  attack (other, dt = 1) {
    var isHitted = this.canAttack(other)
    if (isHitted) {
      other.getDamage(this.damage, dt)
    }
    return isHitted
  }
  // can attack other
  canAttack (other) {
    return collisionDetection.RectRectDistance(this, other) <= this.attackDistance
  }
  die () {
    this.trigger('die', arguments)
  }
  center () {
    return {
      x: this.x + this.width / 2,
      y: this.y + this.height / 2
    }
  }
  trigger (eventName, args) {
    if (this.listeners[eventName]) {
      for (const event of this.listeners[eventName]) {
        if (typeof event === 'function') {
          event.apply(this, args)
        }
      }
    }
  }
  on (eventName, callback) {
    if (!this.listeners[eventName]) {
      this.listeners[eventName] = []
    }
    this.listeners[eventName].push(callback)
  }
}

class Event {
  constructor (options) {
    const defaults = {
      msg: ''
    }
    const populated = Object.assign(defaults, options)
    for (const key in populated) {
      if (populated.hasOwnProperty(key)) {
        this[key] = populated[key]
      }
    }
  }
}

module.exports = Ball
