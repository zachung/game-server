import Ability from './Ability'
import { ABILITY_FIRE, ABILITY_CARRY } from '../../config/constants'

class Fire extends Ability {
  get type () { return ABILITY_FIRE }

  carryBy (owner) {
    super.carryBy(owner)
    this.owner = owner
    owner[ABILITY_FIRE] = this
  }

  fire (rad) {
    let caster = this.owner

    let carryAbility = caster[ABILITY_CARRY]
    let BulletType = carryAbility.getCurrent()
    if (!BulletType) {
      // no skill at inventory
      console.log('no skill at inventory')
      return
    }
    BulletType.cast({caster, rad})
  }

  toString () {
    return 'Fire'
  }
}

export default Fire
