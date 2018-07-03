import { ABILITY_MOVE } from '../../config/constants'

class Move {
  constructor (value) {
    this.type = ABILITY_MOVE
    this.value = value
  }

  // 是否需置換
  hasToReplace (owner) {
    let ability = owner.tickAbilities[this.type.toString()]
    if (!ability) {
      return true
    }
    // 只會加快
    return this.value > ability.value
  }

  // 配備此技能
  carryBy (owner) {
    this.dropBy(owner)
    owner.tickAbilities[this.type.toString()] = this
  }

  dropBy (owner) {
    delete owner.tickAbilities[this.type.toString()]
  }

  // tick
  tick (delta, owner) {
    owner.x += owner.dx * this.value * delta
    owner.y += owner.dy * this.value * delta
  }

  toString () {
    return 'move level: ' + this.value
  }
}

export default Move
