import Texture from '../lib/Texture'
import GameObject from './GameObject'

import { STATIC } from '../config/constants'

class Ground extends GameObject {
  constructor () {
    // Create the cat sprite
    super(Texture.Ground)
  }

  get type () { return STATIC }
}

export default Ground
