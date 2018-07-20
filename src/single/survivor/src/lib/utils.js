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
import FireBolt from '../objects/skills/FireBolt'
import FireStar from '../objects/skills/FireStar'
import WallShootBolt from '../objects/WallShootBolt'

import Move from '../objects/abilities/Move'
import Camera from '../objects/abilities/Camera'
import Operate from '../objects/abilities/Operate'

const PI = Math.PI

// 0x0000 ~ 0x000f
const ItemsStatic = [
  Air, Grass, Ground
]
// 0x0010 ~ 0x00ff
const ItemsStay = [
  // 0x0010, 0x0011, 0x0012
  Wall, IronFence, Root, Tree
]
// 0x0100 ~ 0x01ff
const ItemsOther = [
  Treasure, Door, Torch, GrassDecorate1, FireBolt, WallShootBolt, FireStar
]
// 0x0200 ~ 0x02ff
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
  } else if ((itemId & 0xff00) >>> 8 === 1) {
    Types = ItemsOther
    itemId -= 0x0100
  } else {
    Types = Abilities
    itemId -= 0x0200
  }
  return new Types[itemId](params)
}

export function calcApothem (o, rad) {
  let width = o.width / 2
  let height = o.height / 2
  let rectRad = Math.atan2(height, width)
  let len
  // 如果射出角穿過 width
  let r1 = Math.abs(rad % PI)
  let r2 = Math.abs(rectRad % PI)
  if (r1 < r2 || r1 > r2 + PI / 2) {
    len = width / Math.cos(rad)
  } else {
    len = height / Math.sin(rad)
  }
  return Math.abs(len)
}
