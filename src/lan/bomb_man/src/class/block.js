const Floor = require('./floor')
const Item = require('./item')

class Block extends Floor {
  constructor (options) {
    const defaults = {
      color: '#42a43e',
      hp: 1,
      defence: 0
    }
    const populated = Object.assign(defaults, options)
    super(populated)
    this.class = this.constructor.name
  }
  getDamage (damage, dt = 1) {
    super.getDamage(damage, dt)
  }
  dieOnMapAfter (map) {
    super.dieOnMapAfter(map)
    var loc = this.getLocation()
    var value = 1
    var item = new Item({
      type: this.type, // type
      value: value, // value
      x: this.x,
      y: this.y
    })
    map.setLocation(item, loc.i, loc.j)
  }
}

module.exports = Block
