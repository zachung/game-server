import Texture from '../lib/Texture'
import GameObject from './GameObject'

import { STAY, ABILITY_FIRE } from '../config/constants'

import Learn from './abilities/Learn'
import Carry from '../objects/abilities/Carry'
import Fire from '../objects/abilities/Fire'
import Health from '../objects/abilities/Health'
import Bullet from '../objects/Bullet'

class WallShootBolt extends GameObject {
  constructor (treasures) {
    // Create the cat sprite
    super(Texture.Wall)

    let carry = new Carry(3)
    new Learn().carryBy(this)
      .learn(new Fire([3, 3]))
      .learn(carry)
      .learn(new Health(1000))

    let bullet = new Bullet()
    carry.take(bullet, Infinity)

    this.on('collide', this.actionWith.bind(this))
    this.on('die', this.onDie.bind(this))

    this.anchor.set(0.5, 0.5)
    setInterval(() => {
      let rad = this.rotation
      this[ABILITY_FIRE].fire(rad)
      this[ABILITY_FIRE].fire(rad + Math.PI / 2)
      this[ABILITY_FIRE].fire(rad + Math.PI)
      this[ABILITY_FIRE].fire(rad + Math.PI / 2 * 3)
    }, 200)

    setInterval(() => {
      this.rotation += Math.PI / 30 / 10
    }, 17)
  }

  get type () { return STAY }

  actionWith (operator) {
    operator.emit('collide', this)
  }

  onDie () {
    this.parent.removeChild(this)
    this.destroy()
  }

  toString () {
    return 'WallShootBolt'
  }
}

export default WallShootBolt
