const Floor = require('./floor')
const Fire = require('./fire')

class Bomb extends Floor {
  constructor (options) {
    const defaults = {
      image: 'items/bomb',
      countdown: 2,
      radius: 0,
      hp: 0.01,
      defence: 0,
      width: 60,
      height: 60,
      animationSize: 64
    }
    const populated = Object.assign(defaults, options)
    super(populated)
    this.class = this.constructor.name
  }
  step (dt, map, cell) {
    this.animationSize += dt * this.width * 0.7 // animation speed
    this.countdown -= dt
    if (this.isReadyBoom()) {
      this.die()
    }
  }
  render (app, deltaPoint = { x: 0, y: 0 }) {
    this.renderImage(app, deltaPoint)
  }
  renderImage (app, deltaPoint = { x: 0, y: 0 }) {
    var range = 0.2
    var direct = Math.floor(this.animationSize / this.width / range) % 2
    var size = this.animationSize % (this.width * range)
    var animationSize = this.width + (direct === 1 ? size : this.width * range - size)
    app.layer.drawImage(app.images[this.image], this.x + deltaPoint.x, this.y + deltaPoint.y, animationSize, animationSize)
  }
  isReadyBoom () {
    return this.countdown < 0
  }
  canAttack (other) {
    return collisionDetection.CircleRectDistance(this, other) <= this.radius
  }
  getDamage (damage, dt) {
    return super.getDamage(damage, dt)
  }
  dieOnMapPre (map) {
    super.dieOnMapPre(map)
    var ci = this.inMapLocation.i,
      cj = this.inMapLocation.j,
      radius = this.radius
    map.setLocation(new Fire(), ci, cj)
    for (var i = 1; i <= radius; i++) {
      if (!map.setLocation(new Fire(), ci + i, cj)) {
        break
      }
    }
    for (var i = 1; i <= radius; i++) {
      if (!map.setLocation(new Fire(), ci - i, cj)) {
        break
      }
    }
    for (var i = 1; i <= radius; i++) {
      if (!map.setLocation(new Fire(), ci, cj + i)) {
        break
      }
    }
    for (var i = 1; i <= radius; i++) {
      if (!map.setLocation(new Fire(), ci, cj - i)) {
        break
      }
    }
  }
}

module.exports = Bomb
