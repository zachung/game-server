import keyboardJS from 'keyboardjs'

import { LEFT, UP, RIGHT, DOWN } from '../../config/control'
import { ABILITY_KEY_MOVE } from '../../config/constants'

class Move {
  constructor () {
    this.type = ABILITY_KEY_MOVE
  }

  // 是否需置換
  hasToReplace (owner) {
    return true
  }

  // 配備此技能
  carryBy (owner) {
    owner.abilities[this.type] = this

    this.setup(owner)
  }

  setup (owner) {
    let dir = {}
    let calcDir = () => {
      owner.dx = -dir[LEFT] + dir[RIGHT]
      owner.dy = -dir[UP] + dir[DOWN]
    }
    let bind = code => {
      dir[code] = 0
      let preHandler = e => {
        e.preventRepeat()
        dir[code] = 1
        calcDir()
      }
      keyboardJS.bind(code, preHandler, () => {
        dir[code] = 0
        calcDir()
      })
      return preHandler
    }

    keyboardJS.setContext('')
    keyboardJS.withContext('', () => {
      owner[ABILITY_KEY_MOVE] = {
        [LEFT]: bind(LEFT),
        [UP]: bind(UP),
        [RIGHT]: bind(RIGHT),
        [DOWN]: bind(DOWN)
      }
    })
  }

  dropBy (owner) {
    let ability = owner.abilities[this.type]
    if (ability) {
      keyboardJS.withContext('', () => {
        Object.entries(owner[ABILITY_KEY_MOVE]).forEach(([key, handler]) => {
          keyboardJS.unbind(key, handler)
        })
      })

      delete owner.abilities[this.type]
    }
  }

  toString () {
    return 'key control'
  }
}

export default Move
