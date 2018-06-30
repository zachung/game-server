import { resources } from '../lib/PIXI'
import GameObject from './GameObject'

import { REPLY } from '../config/constants'

class Door extends GameObject {
  constructor (map) {
    // Create the cat sprite
    super(resources['images/town_tiles.json'].textures['door.png'])

    this.map = map[0]
    this.toPosition = map[1]

    this.on('collide', this.actionWith.bind(this))
  }

  get type () { return REPLY }

  actionWith (other, action = 'operate') {
    if (typeof other[action] === 'function') {
      other[action](this)
    }
  }

  operate (other) {
    this.emit('use', this)
  }
}

export default Door
