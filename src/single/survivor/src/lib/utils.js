import Wall from '../objects/Wall'
import Air from '../objects/Air'
import Grass from '../objects/Grass'
import Treasure from '../objects/Treasure'
import Door from '../objects/Door'
import Torch from '../objects/Torch'
import Ground from '../objects/Ground'
import IronFence from '../objects/IronFence'
import Root from '../objects/Root'
import Tree from '../objects/Tree'
import GrassDecorate1 from '../objects/GrassDecorate1'

import Move from '../objects/abilities/Move'
import Camera from '../objects/abilities/Camera'
import Operate from '../objects/abilities/Operate'

// 0x0000 ~ 0x000f
const ItemsStatic = [
  Air, Grass, Ground
]
// 0x0010 ~ 0x00ff
const ItemsStay = [
  // 0x0010, 0x0011, 0x0012
  Wall, IronFence, Root, Tree
]
// 0x0100 ~ 0x0fff
const ItemsOther = [
  Treasure, Door, Torch, GrassDecorate1
]

const Abilities = [
  Move, Camera, Operate
]

export function instanceByItemId (itemId, params) {
  let Types
  itemId = parseInt(itemId, 16)

  if ((itemId & 0xfff0) === 0) {
    // 地板
    Types = ItemsStatic
  } else if ((itemId & 0xff00) === 0) {
    Types = ItemsStay
    itemId -= 0x0010
  } else {
    Types = ItemsOther
    itemId -= 0x0100
  }
  return new Types[itemId](params)
}

export function instanceByAbilityId (abilityId, params) {
  return new Abilities[abilityId](params)
}
