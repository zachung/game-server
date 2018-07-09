import Texture from '../lib/Texture'
import Light from '../lib/Light'
import GameObject from './GameObject'

import { STATIC } from '../config/constants'

class Torch extends GameObject {
  constructor () {
    super(Texture.Torch)

    let radius = 2

    this.on('added', Light.lightOn.bind(null, this, radius, 0.95))
    this.on('removeed', Light.lightOff.bind(null, this))
  }

  get type () { return STATIC }

  toString () {
    return 'torch'
  }
}

export default Torch
