import W from '../objects/Wall'
import G from '../objects/Grass'
import T from '../objects/Treasure'
import D from '../objects/Door'

import Move from '../objects/slots/Move'

const Items = [
  G, W, T, D
]

const Slots = [
  Move
]

export function instanceByItemId (itemId, params) {
  return new Items[itemId](params)
}

export function instanceBySlotId (slotId, params) {
  return new Slots[slotId](params)
}
