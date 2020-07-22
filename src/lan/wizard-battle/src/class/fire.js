const Ball = require('./ball')

class Fire extends Ball {
  constructor (options) {
    const defaults = {
      image: 'fire_bolt',
      width: 50 * 2,
      height: 13 * 2,
      damage: 20,
      hp: 1,
      animationSize: 30,
      attackDistance: 0,
      punchForce: 5,
      thirdForce: 2
    }
    const populated = Object.assign(defaults, options)
    super(populated)
    this.class = this.constructor.name
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
        app.images[this.image],
        -this.width / 2,
        -this.height / 2,
        this.width,
        this.height
      )
      .restore()
  }
}

module.exports = Fire
