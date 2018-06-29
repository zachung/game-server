import { resources } from '../lib/PIXI'
import GameObject from './GameObject'

import { STAY } from '../config/constants'

class Wall extends GameObject {
  constructor (treasures) {
    // Create the cat sprite
    super(resources['images/town_tiles.json'].textures['wall.png'])
  }

  get type () { return STAY }
}

export default Wall
