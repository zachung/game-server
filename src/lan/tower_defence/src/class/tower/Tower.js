const Ball = require('../ball')
const Guid = require('../../../../../library/Guid')
const Window = require('../../gui/Window')

class Tower extends Ball {
  constructor (options) {
    const defaults = {
      width: 60,
      height: 60,
      damage: 10,
      attackDistance: 300,
      colddown: 1,
      lifetime: 0,
      preAttackTime: 0,
      isShowArea: true,
      level: 0
    }
    const populated = Object.assign(defaults, options)
    super(populated)
  }
  static get DAMAGE () {
    return 'damage'
  }
  static get RADIUS () {
    return 'radius'
  }
  static get COLDDOWN () {
    return 'cd'
  }
  get cost () {
    return 10
  }
  get sellIncome () {
    return 10
  }
  onStep (dt) {
    this.lifetime += dt
    super.onStep.apply(this, arguments)
  }
  onAttack (other, dt = 1) {
    this.preAttackTime = this.lifetime
  }
  attack (other, dt = 1) {
    if (!this.isColddown(dt)) {
      return
    }
    var isHitted = this.canAttack(other)
    if (isHitted) {
      this.trigger('attack', other, dt)
      this.nextshot = 0
    }
    return isHitted
  }
  isColddown (dt) {
    return this.nextshot < this.colddown
  }
  get throwObject () {
    let center = this.center
    return new this.projectileClass({
      x: center.x,
      y: center.y,
      damage: this.damage,
      id: Guid.gen(this.projectileClass)
    })
  }
  onMousedown (point) {
    if (point.button === 'left') {
      if (Tower.isInRect(point, this)) {
        this.isShowArea = true
        return false
      }
    }
    this.isShowArea = false
  }
  render (app, deltaPoint = { x: 0, y: 0 }) {
    super.renderImage.apply(this, arguments)
    if (this.isShowArea) {
      this.renderAttackDistance(app, deltaPoint)
    }
  }
  renderAttackDistance (app, deltaPoint) {
    let center = this.center
    var x = center.x + deltaPoint.x
    var y = center.y + deltaPoint.y
    app.layer
      .fillStyle('rgba(255, 255, 255, 0.3)')
      .fillCircle(x, y, this.attackDistance)
  }
  hasUpgradeOption () {
    // subclass implements
    return this.upgradeOptions.length > 0
  }
  get upgradeOptions () {
    return []
  }
  upgrade () {
    if (!this.hasUpgradeOption()) {
      return
    }
    let option = this.upgradeOptions[0]
    this.trigger('upgrade', option, () => {
      option.attrs.forEach(attr => this.upgradeWithSpecificOption(attr.type, attr.value))
      this.level++
    })
  }
  upgradeWithSpecificOption (type, value) {
    switch (type) {
      case Tower.DAMAGE:
        this.damage += value
        break
      case Tower.RADIUS:
        this.attackDistance += value
        break
      case Tower.COLDDOWN:
        this.colddown += value
        break
    }
  }
}

module.exports = Tower
