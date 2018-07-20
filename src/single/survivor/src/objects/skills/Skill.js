import { Sprite } from '../../lib/PIXI'

class Skill {
  constructor (level) {
    this.level = level
  }

  cost () {
    
  }

  static sprite (texture) {
    return new Sprite(texture)
  }
}

export default Skill
