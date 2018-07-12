import Texture from '../lib/Texture'
import GameObject from './GameObject'

import { STATIC } from '../config/constants'

class Ground extends GameObject {
  constructor () {
    // Create the cat sprite
    super(Texture.Ground)
  }

  get type () { return STATIC }

  toString () {
    return 'Ground'
  }
}

export default Ground
