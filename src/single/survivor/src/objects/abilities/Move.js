import Ability from './Ability'
import { ABILITY_MOVE } from '../../config/constants'

class Move extends Ability {
  constructor (value) {
    super()
    this.value = value
  }

  get type () { return ABILITY_MOVE }

  isBetter (other) {
    // 只會加快
    return this.value > other.value
  }

  // 配備此技能
  carryBy (owner) {
    super.carryBy(owner)
    owner.tickAbilities[this.type.toString()] = this
  }

  // tick
  tick (delta, owner) {
    // NOTICE: 假設自己是正方形
    let scale = owner.scale.x
    owner.x += owner.dx * this.value * scale * delta
    owner.y += owner.dy * this.value * scale * delta
  }

  toString () {
    return 'move level: ' + this.value
  }
}

export default Move
