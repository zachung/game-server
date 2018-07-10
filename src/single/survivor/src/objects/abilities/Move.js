import Ability from './Ability'
import { ABILITY_MOVE } from '../../config/constants'
import Vector from '../../lib/Vector'

class Move extends Ability {
  constructor (value) {
    super()
    this.value = value
    this.dx = 0
    this.dy = 0
  }

  get type () { return ABILITY_MOVE }

  isBetter (other) {
    // 只會加快
    return this.value > other.value
  }

  // 配備此技能
  carryBy (owner) {
    super.carryBy(owner)
    this.owner = owner
    owner[ABILITY_MOVE] = this
    owner.tickAbilities[this.type.toString()] = this
  }

  // @point 相對於 owner 的點
  moveTo (point) {
    let vector = Vector.fromPoint(point)
    let len = vector.length
    this.dx = vector.x / len
    this.dy = vector.y / len
  }

  // tick
  tick (delta, owner) {
    let moveAbility = owner[ABILITY_MOVE]
    // NOTICE: 假設自己是正方形
    let scale = owner.scale.x
    owner.x += moveAbility.dx * this.value * scale * delta
    owner.y += moveAbility.dy * this.value * scale * delta
  }

  toString () {
    return 'move level: ' + this.value
  }
}

export default Move
