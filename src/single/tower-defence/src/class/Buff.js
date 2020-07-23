const Ball = require('./ball')

class Buff extends Ball {
  constructor (options) {
    const defaults = {
      name: 'Ice',
      width: 64,
      height: 64,
      duration: 1,
      lifetime: 0,
      image: 'effect/bolt03'
    }
    const populated = Object.assign(defaults, options)
    super(populated)
  }
  effect (other) {
    other.mass *= 2
    this.other = other
  }
  step (dt) {
    this.lifetime += dt
    let center = this.other.center
    this.setCenter(center.x, center.y)
    if (this.lifetime > this.duration) {
      this.other.mass /= 2
      this.other.removeBuff(this)
    }
  }
  render () {
    super.renderImage.apply(this, arguments)
  }
}

module.exports = Buff
