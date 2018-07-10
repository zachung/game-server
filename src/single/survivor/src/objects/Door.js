import Texture from '../lib/Texture'
import GameObject from './GameObject'

import { STAY, ABILITY_OPERATE } from '../config/constants'

class Door extends GameObject {
  constructor (map) {
    // Create the cat sprite
    super(Texture.Door)

    this.map = map[0]
    this.toPosition = map[1]

    this.on('collide', this.actionWith.bind(this))
  }

  get type () { return STAY }

  actionWith (operator) {
    let ability = operator[ABILITY_OPERATE]
    if (!ability) {
      this.say([
        operator.toString(),
        ' dosen\'t has ability to use this door ',
        this.map,
        '.'
      ].join(''))
    } else {
      ability(this)
    }
  }

  [ABILITY_OPERATE] () {
    this.say(['Get in ', this.map, ' now.'].join(''))
    this.emit('use')
  }

  toString () {
    return 'Door'
  }
}

export default Door
