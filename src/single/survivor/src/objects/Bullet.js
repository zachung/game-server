import Texture from '../lib/Texture'
import GameObject from './GameObject'
import { REPLY, ABILITY_MOVE } from '../config/constants'

import Learn from './abilities/Learn'
import Move from '../objects/abilities/Move'

class Bullet extends GameObject {
  constructor (speed) {
    super(Texture.Bullet)

    new Learn().carryBy(this)
      .learn(new Move([speed, 0]))

    this.on('collide', this.actionWith.bind(this))
  }

  get type () { return REPLY }

  actionWith (operator) {
    if (operator === this.owner) {
      return
    }
    super.say([
      'hitted ',
      operator.toString(),
      '.'
    ].join(''))

    this.parent.removeChild(this)
    this.destroy()
  }

  toString () {
    return 'Bullet'
  }

  say () {
    // say nothing
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
