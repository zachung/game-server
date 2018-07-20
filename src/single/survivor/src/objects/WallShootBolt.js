import Texture from '../lib/Texture'
import GameObject from './GameObject'

import { STAY, ABILITY_FIRE } from '../config/constants'

import Learn from './abilities/Learn'
import Carry from '../objects/abilities/Carry'
import Fire from '../objects/abilities/Fire'
import Health from '../objects/abilities/Health'
import FireBolt from '../objects/skills/FireBolt'

class WallShootBolt extends GameObject {
  constructor (treasures) {
    // Create the cat sprite
    super(Texture.Wall)

    let carry = new Carry(3)
    new Learn().carryBy(this)
      .learn(new Fire())
      .learn(carry)
      .learn(new Health(10))

    carry.take(new FireBolt(0), Infinity)

    this.life = 0
    this.on('collide', this.actionWith.bind(this))
    this.on('die', this.onDie.bind(this))
  }

  get type () { return STAY }

  bodyOpt () {
    return {
      isStatic: true
    }
  }

  actionWith (operator) {
    operator.emit('collide', this)
  }

  onDie () {
    this.parent.willRemoveChild(this)
  }

  tick (delta) {
    this.life++
    if (this.life % 10 !== 0) {
      return
    }
    this.life = 0
    this.rotate(Math.PI / 10, true)

    let rad = this.rotation
    this[ABILITY_FIRE].fire(rad)
    this[ABILITY_FIRE].fire(rad + Math.PI / 2)
    this[ABILITY_FIRE].fire(rad + Math.PI)
    this[ABILITY_FIRE].fire(rad + Math.PI / 2 * 3)
  }

  toString () {
    return 'WallShootBolt'
  }
}

export default WallShootBolt
