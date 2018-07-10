import Texture from '../lib/Texture'
import GameObject from './GameObject'

import Learn from './abilities/Learn'
import Move from '../objects/abilities/Move'
import KeyMove from '../objects/abilities/KeyMove'
import Camera from '../objects/abilities/Camera'
import Carry from '../objects/abilities/Carry'
import Place from '../objects/abilities/Place'
import KeyPlace from '../objects/abilities/KeyPlace'

class Cat extends GameObject {
  constructor () {
    // Create the cat sprite
    super(Texture.Rock)

    this.tickAbilities = {}
    this.abilities = {}

    new Learn().carryBy(this)
      .learn(new Move(3))
      .learn(new KeyMove())
      .learn(new Place())
      .learn(new KeyPlace())
      .learn(new Camera(1))
      .learn(new Carry(1))
  }

  toString () {
    return 'you'
  }

  tick (delta) {
    Object.values(this.tickAbilities).forEach(ability => ability.tick(delta, this))
  }
}

export default Cat
