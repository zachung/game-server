import { MOVE } from '../../config/constants'

class Move {
  constructor (value) {
    this.type = MOVE
    this.value = value
  }

  // 是否需置換
  hasToReplace (owner) {
    let other = owner.tickAbilities[this.type]
    if (!other) {
      return true
    }
    // 只會加快
    return this.value > other.value
  }

  // 配備此技能
  carryBy (owner) {
    owner.tickAbilities[this.type] = this
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
