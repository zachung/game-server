const Floor = require('./floor')

class Item extends Floor {
  constructor (options) {
    const defaults = {
      color: '#00a4ae',
      hp: 1,
      defence: 0
    }
    const populated = Object.assign(defaults, options)
    super(populated)
    this.class = this.constructor.name
  }
  render (app, deltaPoint = { x: 0, y: 0 }) {
    switch (this.type) {
      case 0:
        this.image = 'items/Icon_blastup'
        break
      case 1:
        this.image = 'items/Icon_countup'
        break
      case 2:
        this.image = 'items/Icon_healthup'
        break
      case 3:
        this.image = 'items/Icon_speedup'
        break
    }
    this.renderImage(app, deltaPoint)
  }
  sendTo (user) {
    switch (this.type) {
      case 0: // fire up
        user.fireRadius += this.value
        break
      case 1: // fire up
        user.bombCountMax += this.value
        break
      case 2: // fire up
        user.hp += this.value
        break
      case 3: // fire up
        user.speed += this.value * 30
        user.speed = Math.min(user.speed, 512)
        break
    }
  }
}

module.exports = Item
