const Floor = require('./floor')

class Thomas extends Floor {
  constructor (options) {
    const defaults = {
      width: 50,
      height: 50,
      defence: 0,
      fireRadius: 2,
      bombCount: 0,
      bombCountMax: 10,
      speed: 256
    }
    const populated = Object.assign(defaults, options)
    super(populated)
    this.faceDirectBits = 0b0000 // LRUD
    this.canActive = true
  }
  takeWeapon (weapon) {
    this.weapon = weapon
  }
  fire (dt) {
    if (!this.weapon) {

    }
    // this.weapon.fire(this.x, this.y, dt);
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
}

module.exports = Thomas
