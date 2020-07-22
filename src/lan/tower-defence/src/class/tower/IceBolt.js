const FireBolt = require('./FireBolt')
const Buff = require('../Buff')

class IceBolt extends FireBolt {
  constructor (options) {
    const defaults = {
      width: 64,
      height: 64,
      attackDistance: 0,
      mass: 0.1
    }
    const populated = Object.assign(defaults, options)
    super(populated)
  }
  goto (other) {
    super.goto.apply(this, arguments)
    this.setCenter(other.center)
  }
  attack (other, dt = 1) {
    let isHitted = super.attack.apply(this, arguments)
    if (isHitted) {
      other.addBuff(new Buff())
    }
  }
}

module.exports = IceBolt
