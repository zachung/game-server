import Texture from '../lib/Texture'
import GameObject from './GameObject'
import { REPLY } from '../config/constants'

import Learn from './abilities/Learn'
import Move from '../objects/abilities/Move'
import KeyMove from '../objects/abilities/KeyMove'
import Camera from '../objects/abilities/Camera'
import Carry from '../objects/abilities/Carry'
import Place from '../objects/abilities/Place'
import KeyPlace from '../objects/abilities/KeyPlace'
import Fire from '../objects/abilities/Fire'
import KeyFire from '../objects/abilities/KeyFire'
import Rotate from '../objects/abilities/Rotate'
import Health from '../objects/abilities/Health'
import Bullet from '../objects/Bullet'

class Cat extends GameObject {
  constructor () {
    super(Texture.Rock)

    let carry = new Carry(3)
    new Learn().carryBy(this)
      .learn(new Move([1]))
      .learn(new KeyMove())
      .learn(new Place())
      .learn(new KeyPlace())
      .learn(new Camera(1))
      .learn(carry)
      .learn(new Fire([3, 3]))
      .learn(new Rotate())
      .learn(new KeyFire())
      .learn(new Health(10))

    let bullet = new Bullet()
    carry.take(bullet, Infinity)
  }

  get type () { return REPLY }

  toString () {
    return 'you'
  }
}

export default Cat
