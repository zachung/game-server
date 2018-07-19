import Ability from './Ability'
import { ABILITY_DAMAGE, ABILITY_HEALTH } from '../../config/constants'

class Damage extends Ability {
  constructor ([damage = 1, force = 0.01]) {
    super()
    this.damage = damage
    this.force = force
  }

  get type () { return ABILITY_DAMAGE }

  carryBy (owner) {
    super.carryBy(owner)
    this.owner = owner
    owner[ABILITY_DAMAGE] = this
  }

  effect (other) {
    let healthAbility = other[ABILITY_HEALTH]
    // 傷害他人
    if (healthAbility) {
      healthAbility.getHurt(this.owner)
    }
  }

  toString () {
    return [
      'Damage: ',
      this.damage,
      ', ',
      this.force
    ].join('')
  }
}

export default Damage
