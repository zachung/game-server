import Texture from '../lib/Texture'
import GameObject from './GameObject'

import { STAY } from '../config/constants'

class Tree extends GameObject {
  constructor () {
    super(Texture.Tree)
  }

  get type () { return STAY }
}

export default Tree
