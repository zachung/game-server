import Texture from '../lib/Texture'
import GameObject from './GameObject'
import { REPLY, ABILITY_MOVE, ABILITY_HEALTH } from '../config/constants'
import { Body } from '../lib/Matter'

import Learn from './abilities/Learn'
import Move from '../objects/abilities/Move'
import Health from '../objects/abilities/Health'

class Bullet extends GameObject {
  constructor () {
    super(Texture.Bullet)

    new Learn().carryBy(this)
      .learn(new Move([2, 0]))
      .learn(new Health(1))

    this.on('collide', this.actionWith.bind(this))
    this.on('die', this.onDie.bind(this))
  }

  get type () { return REPLY }

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
    // TODO: 收到他人傷害
    this[ABILITY_HEALTH].getHurt({
      damage: 1
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
      this.rotation = vector.rad
      Body.setAngle(this.body, vector.rad)
    }
  }
}

export default Bullet
