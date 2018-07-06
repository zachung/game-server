import Texture from '../lib/Texture'
import GameObject from './GameObject'

import { STAY } from '../config/constants'

class Wall extends GameObject {
  constructor (treasures) {
    // Create the cat sprite
    super(Texture.Wall)
  }

  get type () { return STAY }
}

export default Wall
