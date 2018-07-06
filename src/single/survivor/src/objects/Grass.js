import Texture from '../lib/Texture'
import GameObject from './GameObject'

import { STATIC } from '../config/constants'

class Grass extends GameObject {
  constructor (treasures) {
    // Create the cat sprite
    super(Texture.Grass)
  }

  get type () { return STATIC }
}

export default Grass
