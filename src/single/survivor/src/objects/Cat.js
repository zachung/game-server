import Texture from '../lib/Texture'
import GameObject from './GameObject'

import Learn from './abilities/Learn'
import Move from '../objects/abilities/Move'
import KeyMove from '../objects/abilities/KeyMove'
import Camera from '../objects/abilities/Camera'
import Carry from '../objects/abilities/Carry'
import Place from '../objects/abilities/Place'
import KeyPlace from '../objects/abilities/KeyPlace'
import Fire from '../objects/abilities/Fire'
import KeyFire from '../objects/abilities/KeyFire'

class Cat extends GameObject {
  constructor () {
    super(Texture.Rock)

    new Learn().carryBy(this)
      .learn(new Move([2, 0.1]))
      .learn(new KeyMove())
      .learn(new Place())
      .learn(new KeyPlace())
      .learn(new Camera(1))
      .learn(new Carry(3))
      .learn(new Fire([3, 3]))
      .learn(new KeyFire())
  }

  toString () {
    return 'you'
  }

  tick (delta) {
    Object.values(this.tickAbilities).forEach(ability => ability.tick(delta, this))
  }
}

export default Cat
