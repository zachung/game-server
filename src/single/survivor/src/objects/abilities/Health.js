import Ability from './Ability'
import { ABILITY_HEALTH, ABILITY_DAMAGE, ABILITY_MOVE } from '../../config/constants'
import Vector from '../../lib/Vector'

class Health extends Ability {
  constructor (hp = 1) {
    super()
    this.hp = hp
    this.hpMax = hp
  }

  get type () { return ABILITY_HEALTH }

  carryBy (owner) {
    super.carryBy(owner)
    this.owner = owner
    owner[ABILITY_HEALTH] = this
  }

  getHurt (from) {
    let damageAbility = from[ABILITY_DAMAGE]
    if (!damageAbility) {
      return
    }
    let force = damageAbility.force
    let damage = damageAbility.damage
    let preHp = this.hp
    let sufHp = Math.max(this.hp - damage, 0)
    let vector = Vector.fromPoint(this.owner.position)
      .sub(from.position)
      .setLength(force)

    this.owner.say([
      this.owner.toString(),
      ' get hurt ',
      damage,
      ': ',
      preHp,
      ' -> ',
      sufHp
    ].join(''))

    let moveAbility = this.owner[ABILITY_MOVE]
    if (moveAbility) {
      moveAbility.punch(vector)
    }

    this.hp = sufHp

    this.owner.emit('health-change')
    if (this.hp <= 0) {
      this.owner.emit('die')
    }
  }

  toString () {
    return [
      'Health: ',
      this.hp,
      ' / ',
      this.hpMax
    ].join('')
  }
}

export default Health
