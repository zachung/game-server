import { resources } from '../lib/PIXI'
import GameObject from './GameObject'

import { REPLY } from '../config/constants'
import { instanceBySlotId } from '../lib/utils'

class Treasure extends GameObject {
  constructor (inventories = []) {
    // Create the cat sprite
    super(resources['images/town_tiles.json'].textures['treasure.png'])

    this.inventories = inventories.map(conf => {
      return instanceBySlotId(conf[0], conf[1])
    })

    this.on('collide', this.actionWith.bind(this))
  }

  toString () {
    return [
      'treasure: [',
      this.inventories.map(inventory => {
        return [inventory.type, ': ', inventory.value].join('')
      }).join(', '),
      ']'
    ].join('')
  }

  get type () { return REPLY }

  actionWith (other, action = 'take') {
    if (typeof other[action] === 'function') {
      other[action](this.inventories)
      this.emit(action)
    }
  }
}

export default Treasure
