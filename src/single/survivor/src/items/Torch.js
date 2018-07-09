import Texture from '../lib/Texture'
import GameObject from '../objects/GameObject'

class Torch extends GameObject {
  constructor () {
    super(Texture.Torch)
  }

  toString () {
    return 'torch'
  }
}

export default Torch
