import Texture from '../lib/Texture'
import GameObject from './GameObject'

import { STATIC } from '../config/constants'

class GrassDecorate1 extends GameObject {
  constructor () {
    super(Texture.GrassDecorate1)
  }

  get type () { return STATIC }
}

export default GrassDecorate1
