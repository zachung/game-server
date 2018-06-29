import W from '../objects/Wall'
import G from '../objects/Grass'
import T from '../objects/Treasure'
import D from '../objects/Door'

import Move from '../objects/slots/Move'

export const E0N0 = {
  map: [
    [W, W, W, W, W, W, W, W, W, W],
    [W, G, G, G, G, G, G, G, G, W],
    [W, G, G, G, G, G, G, G, G, W],
    [W, G, G, G, G, G, G, G, G, W],
    [W, G, G, G, G, G, G, G, G, W],
    [W, G, G, G, G, G, G, G, G, W],
    [W, G, G, G, G, G, G, G, G, W],
    [W, G, G, G, G, G, G, G, G, W],
    [W, G, G, G, G, G, G, G, G, W],
    [W, G, W, W, W, W, W, W, W, W]
  ],
  items: [
    {
      Type: T,
      pos: [3, 4],
      params: [
        [Move, 2]
      ]
    }, {
      Type: D,
      pos: [1, 9],
      params: [
        'E0S0'
      ]
    }
  ]
}
export const E0S0 = {
  map: [
    [W, G, W, W, W, W, W, W, W, W],
    [W, G, G, G, G, G, G, G, G, W],
    [W, G, G, G, G, G, G, G, G, W],
    [W, G, G, G, G, G, G, G, G, W],
    [W, G, G, G, G, G, G, G, G, W],
    [W, G, G, G, G, G, G, G, G, W],
    [W, G, G, G, G, G, G, G, G, W],
    [W, G, G, G, G, G, G, G, G, W],
    [W, G, G, G, G, G, G, G, G, W],
    [W, W, W, W, W, W, W, W, W, W]
  ],
  items: [
    {
      Type: T,
      pos: [3, 4],
      params: [
        [Move, 2]
      ]
    }, {
      Type: D,
      pos: [1, 0],
      params: [
        'E0N0'
      ]
    }
  ]
}
