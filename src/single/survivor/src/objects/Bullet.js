import Texture from '../lib/Texture'
import GameObject from './GameObject'
import { REPLY, ABILITY_MOVE, ABILITY_HEALTH } from '../config/constants'

import Learn from './abilities/Learn'
import Move from '../objects/abilities/Move'

class Bullet extends GameObject {
  constructor () {
    super(Texture.Bullet)

    new Learn().carryBy(this)
      .learn(new Move([1, 0]))

    this.on('collide', this.actionWith.bind(this))
  }

  get type () { return REPLY }

  actionWith (operator) {
    if (this.owner === operator ||
      this.owner === operator.owner) {
      // 避免自殺
      return
    }
    let healthAbility = operator[ABILITY_HEALTH]
    if (healthAbility) {
      healthAbility.getHurt({
        damage: 1
      })
    }

    this.parent.removeChild(this)
    this.destroy()
  }

  setOwner (owner) {
    this.owner = owner
  }

  toString () {
    return 'Bullet'
  }

  say () {
    // say nothing
  }

  setDirection (vector) {
    let moveAbility = this[ABILITY_MOVE]
    if (moveAbility) {
      moveAbility.setDirection(vector)
      this.rotation = vector.rad
    }
  }

  tick (delta) {
    Object.values(this.tickAbilities).forEach(ability => ability.tick(delta, this))
  }
}

export default Bullet
