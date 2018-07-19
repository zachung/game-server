import Texture from '../lib/Texture'
import GameObject from './GameObject'
import { REPLY, ABILITY_MOVE, ABILITY_DAMAGE } from '../config/constants'

import Learn from './abilities/Learn'
import Move from '../objects/abilities/Move'
import Health from '../objects/abilities/Health'
import Damage from '../objects/abilities/Damage'

const HealthPoint = 1

class Bullet extends GameObject {
  constructor () {
    super(Texture.Bullet)

    new Learn().carryBy(this)
      .learn(new Move([2, 0]))
      .learn(new Health(HealthPoint))
      .learn(new Damage([1, 0.01]))

    this.on('collide', this.actionWith.bind(this))
    this.on('die', this.onDie.bind(this))
  }

  get type () { return REPLY }

  bodyOpt () {
    return {
      isSensor: true
    }
  }

  actionWith (operator) {
    if (this.owner === operator ||
      this.owner === operator.owner) {
      // 避免自殺
      return
    }
    let damageAbility = this[ABILITY_DAMAGE]
    damageAbility.effect(operator)
    // 自我毀滅
    this.onDie()
  }

  onDie () {
    this.parent.willRemoveChild(this)
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
      this.rotate(vector.rad)
    }
  }
}

export default Bullet
