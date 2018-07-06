import W from '../objects/Wall'
import G from '../objects/Grass'
import T from '../objects/Treasure'
import D from '../objects/Door'
import Torch from '../objects/Torch'

import Move from '../objects/abilities/Move'
import Camera from '../objects/abilities/Camera'
import Operate from '../objects/abilities/Operate'

const Items = [
  G, W, T, D, Torch
]

const Abilities = [
  Move, Camera, Operate
]

export function instanceByItemId (itemId, params) {
  return new Items[itemId](params)
}

export function instanceByAbilityId (abilityId, params) {
  return new Abilities[abilityId](params)
}
