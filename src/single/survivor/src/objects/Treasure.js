import Texture from '../lib/Texture'
import GameObject from './GameObject'

import { REPLY, ABILITY_CARRY } from '../config/constants'
import { instanceByItemId } from '../lib/utils'

class Slot {
  constructor ([itemId, params, count]) {
    this.item = instanceByItemId(itemId, params)
    this.count = count
  }

  toString () {
    return [this.item.toString(), '(', this.count, ')'].join('')
  }
}

class Treasure extends GameObject {
  constructor (inventories = []) {
    // Create the cat sprite
    super(Texture.Treasure)

    this.inventories = inventories.map(treasure => new Slot(treasure))

    this.on('collide', this.actionWith.bind(this))
  }

  get type () { return REPLY }

  actionWith (operator) {
    let carryAbility = operator[ABILITY_CARRY]
    if (!carryAbility) {
      operator.say('I can\'t carry items not yet.')
      return
    }

    this.inventories.forEach(
      treasure => carryAbility.take(treasure.item, treasure.count))
    operator.say(['I taked ', this.toString()].join(''))

    this.parent.willRemoveChild(this)
  }

  toString () {
    return [
      'treasure: [',
      this.inventories.join(', '),
      ']'
    ].join('')
  }
}

export default Treasure
