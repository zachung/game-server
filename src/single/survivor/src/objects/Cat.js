import Texture from '../lib/Texture'
import GameObject from './GameObject'

class Cat extends GameObject {
  constructor () {
    // Create the cat sprite
    super(Texture.Rock)

    // Change the sprite's position
    this.dx = 0
    this.dy = 0

    this.tickAbilities = {}
    this.abilities = {}
  }

  takeAbility (ability) {
    if (ability.hasToReplace(this, ability)) {
      ability.carryBy(this)
      this.emit('ability-carry', ability)
    }
  }

  toString () {
    return 'you'
  }

  tick (delta) {
    Object.values(this.tickAbilities).forEach(ability => ability.tick(delta, this))
  }
}

export default Cat
