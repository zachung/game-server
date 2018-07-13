/* global addEventListener, removeEventListener */
import Ability from './Ability'
import { ABILITY_FIRE, ABILITY_KEY_FIRE } from '../../config/constants'

class KeyFire extends Ability {
  get type () { return ABILITY_KEY_FIRE }

  isBetter (other) {
    return false
  }

  // 配備此技能
  carryBy (owner) {
    super.carryBy(owner)
    this.setup(owner)
  }

  setup (owner) {
    let fireAbility = owner[ABILITY_FIRE]
    let bind = () => {
      let handler = e => {
        fireAbility.fire()
      }
      addEventListener('click', handler)
      return handler
    }

    owner[ABILITY_KEY_FIRE] = bind()
  }

  dropBy (owner) {
    super.dropBy(owner)
    removeEventListener('click', owner[ABILITY_KEY_FIRE])
    delete owner[ABILITY_KEY_FIRE]
  }

  toString () {
    return 'key fire'
  }
}

export default KeyFire
