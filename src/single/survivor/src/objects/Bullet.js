import Texture from '../lib/Texture'
import GameObject from './GameObject'
import { REPLY, ABILITY_MOVE } from '../config/constants'

import Learn from './abilities/Learn'
import Move from '../objects/abilities/Move'

class Bullet extends GameObject {
  constructor (speed) {
    super(Texture.GrassDecorate1)

    new Learn().carryBy(this)
      .learn(new Move(speed))
  }

  get type () { return REPLY }

  toString () {
    return 'Bullet'
  }

  setDirection (point) {
    let moveAbility = this[ABILITY_MOVE]
    if (moveAbility) {
      moveAbility.setDirection(point)
    }
  }

  tick (delta) {
    Object.values(this.tickAbilities).forEach(ability => ability.tick(delta, this))
  }
}

export default Bullet
