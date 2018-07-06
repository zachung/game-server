import { resources } from '../lib/PIXI'
import GameObject from './GameObject'

import { REPLY } from '../config/constants'
import { instanceByAbilityId } from '../lib/utils'

class Treasure extends GameObject {
  constructor (inventories = []) {
    // Create the cat sprite
    super(resources['images/town_tiles.json'].textures['treasure.png'])

    this.inventories = inventories.map(([abilityId, params]) => {
      return instanceByAbilityId(abilityId, params)
    })

    this.on('collide', this.actionWith.bind(this))
  }

  toString () {
    return [
      'treasure: [',
      this.inventories.join(', '),
      ']'
    ].join('')
  }

  get type () { return REPLY }

  actionWith (operator, action = 'takeAbility') {
    // FIXME: 暫時用預設參數 takeAbility
    if (typeof operator[action] === 'function') {
      this.inventories.forEach(treasure => operator[action](treasure))
      this.say([
        operator.toString(),
        ' taked ',
        this.toString()
      ].join(''))

      this.emit('take')
    }
  }
}

export default Treasure
