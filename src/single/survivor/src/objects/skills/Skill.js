import { Sprite } from '../../lib/PIXI'
import { ABILITY_MANA } from '../../config/constants'

class Skill {
  constructor (level) {
    this.level = level
  }

  static sprite (texture) {
    return new Sprite(texture)
  }

  _cost (caster, cost) {
    let manaAbility = caster[ABILITY_MANA]
    if (!manaAbility) {
      return true
    }
    if (!manaAbility.isEnough(cost)) {
      return false
    }
    manaAbility.reduce(cost)
    return true
  }
}

export default Skill
