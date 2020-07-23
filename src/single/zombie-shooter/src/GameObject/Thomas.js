import Ball from './Ball'
import Item from './Item'

class Thomas extends Ball {
  constructor (options) {
    super(options)
    this.hpMax = this.hp
  }
  takeWeapon (weapon) {
    this.weapon = weapon
  }
  attack (enemies, dt) {
    if (!this.weapon) {
      return
    }
    this.weapon.attack(this.x, this.y, dt)
    this.weapon.step(enemies, dt)
  }
  render (layer) {
    super.render(layer)
    // gun bullet
    this.weapon.render(layer)
  }
  faceTo (x, y) {
    super.faceTo(x, y)
    this.weapon.faceTo(this.directRadians)
  }
  getItem (item) {
    switch (item.type) {
      case Item.gunColddown:
        this.weapon.upgrade('colddown', item.value)
        break
    }
  }
}

export default Thomas
