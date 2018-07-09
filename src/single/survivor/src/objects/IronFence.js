import Texture from '../lib/Texture'
import GameObject from './GameObject'

import { STAY } from '../config/constants'

class IronFence extends GameObject {
  constructor (treasures) {
    super(Texture.IronFence)
  }

  get type () { return STAY }
}

export default IronFence
