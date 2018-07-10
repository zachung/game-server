import Ability from './Ability'
import { ABILITY_LEARN } from '../../config/constants'

class Learn extends Ability {
  get type () { return ABILITY_LEARN }

  isBetter (other) {
    return false
  }

  carryBy (owner) {
    if (!owner.abilities) {
      owner.abilities = {}
      owner.tickAbilities = {}
    }
    super.carryBy(owner)
    this.owner = owner
    owner[ABILITY_LEARN] = this
    return this
  }

  learn (ability) {
    let owner = this.owner
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
