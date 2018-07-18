import Texture from '../lib/Texture'
import GameObject from './GameObject'
import { REPLY, ABILITY_MOVE, ABILITY_HEALTH } from '../config/constants'

import Learn from './abilities/Learn'
import Move from '../objects/abilities/Move'
import Health from '../objects/abilities/Health'

const HealthPoint = 1

class Bullet extends GameObject {
  constructor () {
    super(Texture.Bullet)

    new Learn().carryBy(this)
      .learn(new Move([2, 0]))
      .learn(new Health(HealthPoint))

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
    let healthAbility = operator[ABILITY_HEALTH]
    // 傷害他人
    if (healthAbility) {
      healthAbility.getHurt({
        damage: 1
      })
    }
    // 自我毀滅
    this[ABILITY_HEALTH].getHurt({
      damage: HealthPoint
    })
  }

  onDie () {
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
      this.rotate(vector.rad)
    }
  }
}

export default Bullet
