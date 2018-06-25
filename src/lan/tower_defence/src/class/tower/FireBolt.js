const Ball = require('../ball')
const Vector = require('../../../../../library/Vector')

class FireBolt extends Ball {
  constructor (options) {
    const defaults = {
      image: 'fire_bolt',
      width: 50 * 1,
      height: 13 * 1,
      attackDistance: 0,
      mass: 0.1
    }
    const populated = Object.assign(defaults, options)
    super(populated)
  }
  render (app, deltaPoint = { x: 0, y: 0 }) {
    this.renderImage(app, deltaPoint)
  }
  renderImage (app, deltaPoint = { x: 0, y: 0 }) {
    app.layer
      .save()
      .setTransform(1, 0, 0, 1, this.x + deltaPoint.x, this.y + deltaPoint.y)
      .rotate(this.accelerate.angle())
      .drawImage(
        app.images[this.image], -this.width / 2, -this.height / 2,
        this.width,
        this.height
      )
      .restore()
  }
  goto (other) {
    this.from = Vector.fromObject(this)
    this.to = Vector.fromObject(other.center)
    // acceleration
    this.accelerate = this.to.clone().subtract(this.from)
    let length = this.accelerate.length()
    this.accelerate.multiply(new Vector(1 / this.mass / length, 1 / this.mass / length))
  }
  onStep () {
    if (Vector.fromObject(this).subtract(this.from).length() > this.to.clone().subtract(this.from).length()) {
      this.x = this.to.x
      this.y = this.to.y
      this.trigger('atEndPoint')
    }
    super.onStep.apply(this, arguments)
  }
}

module.exports = FireBolt
