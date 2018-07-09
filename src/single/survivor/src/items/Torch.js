import Texture from '../lib/Texture'
import GameObject from './GameObject'

class Torch extends GameObject {
  constructor () {
    super(Texture.Torch)
  }
}

export default Torch
