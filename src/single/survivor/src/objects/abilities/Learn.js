import Ability from './Ability'
import { ABILITY_LEARN } from '../../config/constants'

class Learn extends Ability {
  get type () { return ABILITY_LEARN }

  isBetter (other) {
    return false
  }

  carryBy (owner) {
    super.carryBy(owner)
    owner[ABILITY_LEARN] = this[ABILITY_LEARN].bind(this, owner)
    return owner[ABILITY_LEARN]
  }

  [ABILITY_LEARN] (owner, ability) {
    if (ability.hasToReplace(owner, ability)) {
      ability.carryBy(owner)
      owner.emit('ability-carry', ability)
    }
    return owner[ABILITY_LEARN]
  }

  toString () {
    return 'learning'
  }
}

export default Learn
