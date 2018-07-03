export const CEIL_SIZE = 16

export const ABILITY_MOVE = Symbol('move')
export const ABILITY_CAMERA = Symbol('camera')
export const ABILITY_OPERATE = Symbol('operate')
export const ABILITY_KEY_MOVE = Symbol('key-move')
export const ABILITY_LIFE = Symbol('life')
export const ABILITIES_ALL = [
  ABILITY_MOVE,
  ABILITY_CAMERA,
  ABILITY_OPERATE,
  ABILITY_KEY_MOVE,
  ABILITY_LIFE
]

// object type, static object, not collide with
export const STATIC = 'static'
// collide with
export const STAY = 'stay'
// touch will reply
export const REPLY = 'reply'
