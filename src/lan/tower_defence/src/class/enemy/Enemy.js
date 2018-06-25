const Ball = require('../ball')
const EasingFunctions = require('../../../../../library/EasingFunctions')
const Vector = require('../../../../../library/Vector')

class Enemy extends Ball {
  constructor (options) {
    const defaults = {
      nextPathIndex: 1,
      reward: 0,
      score: 0,
      escapeFine: 0,
      scale: 1,
      hideHpBar: false
    }
    const populated = Object.assign(defaults, options)
    super(populated)
  }
  onStep (dt) {
    let
      from = Vector.fromObject(this.path[this.nextPathIndex - 1]),
      to = Vector.fromObject(this.path[this.nextPathIndex])
    if (Vector.fromObject(this).subtract(from).length() > to.clone().subtract(from).length()) {
      this.nextPathIndex++
      if (!this.path[this.nextPathIndex]) {
        this.trigger('atEndPoint', dt)
        return
      }
    }
    // acceleration
    this.accelerate = to.clone().subtract(from)
    let length = this.accelerate.length()
    this.accelerate.multiply(new Vector(1 / this.mass / length, 1 / this.mass / length))

    super.onStep.apply(this, arguments)
  }
  render () {
    this.renderAtlas.apply(this, arguments)
  }
  renderAtlas (app, deltaPoint = { x: 0, y: 0 }) {
    let isFaceToLeft = Math.abs(this.directRadians) < Math.PI / 2
    let x = this.x + deltaPoint.x + (isFaceToLeft ? 0 : this.width) + this.width * (1 - this.scale)
    let y = this.y + deltaPoint.y + this.height * (1 - this.scale)

    super.renderBuff.apply(this, arguments)

    this.renderRun(app, x, y, isFaceToLeft)
    if (!this.hideHpBar) {
      this.renderHp(app, deltaPoint)
    }
  }
  renderHp (app, deltaPoint) {
    let
      hpX = this.x + deltaPoint.x,
      hpY = this.y - 20 + deltaPoint.y,
      hpW = 50,
      hpH = 10
    app.layer
      .fillStyle('#000')
      .fillRect(hpX, hpY, hpW, hpH)
      .fillStyle('#F00')
      .fillRect(hpX, hpY, hpW * (this.hp / this.hpMax), hpH)
  }
  renderRun (app, x, y, isFaceToLeft) {
    let atlas = app.atlases[this.atlases]
    // 3, 4, 5, 6
    let length = this.accelerate.length()
    let current = ((app.lifetime * length * 2) % 2 / 2) * 4 | 0
    current += 3

    app.layer
      .save()
      .setTransform(this.scale, 0, 0, this.scale, x, y)
      .scale(isFaceToLeft ? 1 : -1, 1)
      .drawAtlasFrame(atlas, current, 0, 0)
      .restore()
  }
  setPath (path) {
    this.path = path
  }
}

module.exports = Enemy
