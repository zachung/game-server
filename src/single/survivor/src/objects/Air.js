import Texture from '../lib/Texture'
import GameObject from './GameObject'

import { STATIC } from '../config/constants'

class Air extends GameObject {
  constructor () {
    // Create the cat sprite
    super(Texture.Air)
  }

  get type () { return STATIC }
}

export default Air
