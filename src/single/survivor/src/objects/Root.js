import Texture from '../lib/Texture'
import GameObject from './GameObject'

import { STAY } from '../config/constants'

class Root extends GameObject {
  constructor (treasures) {
    // Create the cat sprite
    super(Texture.Root)
  }

  get type () { return STAY }
}

export default Root
