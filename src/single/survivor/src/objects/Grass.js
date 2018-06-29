import { resources } from '../lib/PIXI'
import GameObject from './GameObject'

import { STATIC } from '../config/constants'

class Grass extends GameObject {
  constructor (treasures) {
    // Create the cat sprite
    super(resources['images/town_tiles.json'].textures['grass.png'])
  }

  get type () { return STATIC }
}

export default Grass
