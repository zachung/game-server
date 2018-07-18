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
      .learn(new Health(10))

    let bullet = new Bullet()
    carry.take(bullet, Infinity)

    this.on('collide', this.actionWith.bind(this))
    this.on('die', this.onDie.bind(this))
    this.once('added', this.setup.bind(this))
  }

  get type () { return STAY }

  setup () {
    this.timer = setInterval(() => {
      this.rotate(Math.PI / 10, true)

      let rad = this.rotation
      this[ABILITY_FIRE].fire(rad)
      this[ABILITY_FIRE].fire(rad + Math.PI / 2)
      this[ABILITY_FIRE].fire(rad + Math.PI)
      this[ABILITY_FIRE].fire(rad + Math.PI / 2 * 3)
    }, 200)
  }

  actionWith (operator) {
    operator.emit('collide', this)
  }

  onDie () {
    clearInterval(this.timer)
    this.parent.removeChild(this)
    this.destroy()
  }

  toString () {
    return 'WallShootBolt'
  }
}

export default WallShootBolt
