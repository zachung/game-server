import { resources } from '../lib/PIXI'
import GameObject from './GameObject'

class Cat extends GameObject {
  constructor () {
    // Create the cat sprite
    super(resources['images/town_tiles.json'].textures['wall.png'])

    // Change the sprite's position
    this.dx = 0
    this.dy = 0

    this.tickAbilities = {}
    this.abilities = {}
  }

  takeAbility (ability) {
    if (ability.hasToReplace(this)) {
      ability.carryBy(this)
    }
  }

  toString () {
    return 'cat'
  }

  tick (delta) {
    Object.values(this.tickAbilities).forEach(ability => ability.tick(delta, this))
  }
}

export default Cat
