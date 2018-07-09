import Texture from '../lib/Texture'
import GameObject from './GameObject'

import Learn from './abilities/Learn'
import Move from '../objects/abilities/Move'
import KeyMove from '../objects/abilities/KeyMove'
import Camera from '../objects/abilities/Camera'
import Carry from '../objects/abilities/Carry'

class Cat extends GameObject {
  constructor () {
    // Create the cat sprite
    super(Texture.Rock)

    this.tickAbilities = {}
    this.abilities = {}

    new Learn().carryBy(this)(
      new Move(3))(
      new KeyMove())(
      new Camera(1))(
      new Carry(1))
  }

  toString () {
    return 'you'
  }

  tick (delta) {
    Object.values(this.tickAbilities).forEach(ability => ability.tick(delta, this))
  }
}

export default Cat
