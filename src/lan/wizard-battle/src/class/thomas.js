const Ball = require('./ball')
const EasingFunctions = require('../../../../library/EasingFunctions')
const Vector = require('../../../../library/Vector')

class Thomas extends Ball {
  constructor (options) {
    const defaults = {
      width: 72,
      height: 72,
      atlases: 'sorlosheet',
      defence: 0,
      fireRadius: 100,
      bombCount: 0,
      bombCountMax: 10,
      speed: 256,
      defence: 1,
      mass: 0.1,
      friction: 0.01
    }
    const populated = Object.assign(defaults, options)
    super(populated)
    this.faceDirectBits = 0b0000 // LRUD
    this.canActive = true
  }
  run (dt) {
    var
      x = 0,
      y = 0
    x -= (this.faceDirectBits >> 3) & 1 // L
    x += (this.faceDirectBits >> 2) & 1 // R
    y -= (this.faceDirectBits >> 1) & 1 // U
    y += (this.faceDirectBits >> 0) & 1 // D
    // acceleration
    this.accelerate.add(new Vector(x * this.mass, y * this.mass))
  }
  magicAttack (map) {
    let bolt = map.magicAttack(this)
    let thirdForce = bolt.accelerate.clone().rotate(Math.PI).multiply(new Vector(this.mass, this.mass))
    this.accelerate.add(thirdForce)
  }
  setFaceDirectBits (direct) {
    this.faceDirectBits |= direct
  }
  cancelFaceDirectBits (direct) {
    this.faceDirectBits &= direct
  }
  setCanMove (canActive) {
    this.canActive = canActive
  }
  spawnBomb (map) {
    if (this.bombCount >= this.bombCountMax) {
      return
    }
    var user = this
    var bomb = map.spawnBomb(this)
    bomb.on('die', function () {
      user.bombCount--
    })
    this.bombCount++
    return bomb
  }
  render () {
    this.renderAtlas.apply(this, arguments)
  }
  renderAtlas (app, deltaPoint = { x: 0, y: 0 }) {
    let isFaceToLeft = Math.abs(this.directRadians) < Math.PI / 2
    let x = this.x + deltaPoint.x + (isFaceToLeft ? -this.width / 2 : this.width / 2)
    let y = this.y + deltaPoint.y

    let length = this.accelerate.length()
    if (length < 1) {
      this.renderStand(app, x, y, isFaceToLeft)
    } else {
      this.renderRun(app, x, y, isFaceToLeft)
    }
  }
  renderStand (app, x, y, isFaceToLeft) {
    let atlas = app.atlases[this.atlases]
    // 0, 1, 2
    let current = ((app.lifetime * 4) % 2 / 2) * 3 | 0

    app.layer
      .save()
      .setTransform(1, 0, 0, 1, x, y)
      .scale(isFaceToLeft ? 1 : -1, 1)
      .drawAtlasFrame(atlas, current, 0, 0)
      .restore()
  }
  renderRun (app, x, y, isFaceToLeft) {
    let atlas = app.atlases[this.atlases]
    // 3, 4, 5, 6
    let current = ((app.lifetime * 4) % 2 / 2) * 4 | 0
    current += 3

    app.layer
      .save()
      .setTransform(1, 0, 0, 1, x, y)
      .scale(isFaceToLeft ? 1 : -1, 1)
      .drawAtlasFrame(atlas, current, 0, 0)
      .restore()
  }
}

module.exports = Thomas
