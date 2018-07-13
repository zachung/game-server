import Texture from '../lib/Texture'
import GameObject from './GameObject'

import { STAY } from '../config/constants'

class Wall extends GameObject {
  constructor (treasures) {
    // Create the cat sprite
    super(Texture.Wall)

    this.on('collide', this.actionWith.bind(this))
  }

  get type () { return STAY }

  actionWith (operator) {
    operator.emit('collide', this)
  }

  toString () {
    return 'Wall'
  }
}

export default Wall
