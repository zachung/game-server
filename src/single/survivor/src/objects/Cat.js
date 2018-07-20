import Texture from '../lib/Texture'
import GameObject from './GameObject'
import { REPLY, ABILITY_MANA } from '../config/constants'

import Learn from './abilities/Learn'
import Move from '../objects/abilities/Move'
import KeyMove from '../objects/abilities/KeyMove'
import Camera from '../objects/abilities/Camera'
import Carry from '../objects/abilities/Carry'
import Fire from '../objects/abilities/Fire'
import KeyFire from '../objects/abilities/KeyFire'
import Rotate from '../objects/abilities/Rotate'
import Health from '../objects/abilities/Health'
import Mana from '../objects/abilities/Mana'
import FireBolt from '../objects/skills/FireBolt'

class Cat extends GameObject {
  constructor () {
    super(Texture.Rock)

    let carry = new Carry(3)
    new Learn().carryBy(this)
      .learn(new Move([1]))
      .learn(new KeyMove())
      .learn(new Camera(5))
      .learn(carry)
      .learn(new Fire())
      .learn(new Rotate())
      .learn(new KeyFire())
      .learn(new Health(20))
      .learn(new Mana(20))

    carry.take(new FireBolt(0), Infinity)
  }

  get type () { return REPLY }

  bodyOpt () {
    return {
      collisionFilter: {
        category: 0b1,
        mask: 0b111
      }
    }
  }

  tick (delta) {
    this[ABILITY_MANA].tick(delta)
  }

  toString () {
    return 'you'
  }
}

export default Cat
