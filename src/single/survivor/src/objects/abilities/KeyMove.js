import Ability from './Ability'
import keyboardJS from 'keyboardjs'
import { LEFT, UP, RIGHT, DOWN } from '../../config/control'
import { ABILITY_MOVE, ABILITY_KEY_MOVE } from '../../config/constants'

class KeyMove extends Ability {
  get type () { return ABILITY_KEY_MOVE }

  isBetter (other) {
    return false
  }

  // 配備此技能
  carryBy (owner) {
    super.carryBy(owner)
    this.setup(owner)
  }

  setup (owner) {
    let dir = {}
    let calcDir = () => {
      owner[ABILITY_MOVE].dx = -dir[LEFT] + dir[RIGHT]
      owner[ABILITY_MOVE].dy = -dir[UP] + dir[DOWN]
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
    super.dropBy(owner)
    keyboardJS.withContext('', () => {
      Object.entries(owner[ABILITY_KEY_MOVE]).forEach(([key, handler]) => {
        keyboardJS.unbind(key, handler)
      })
    })
    delete owner[ABILITY_KEY_MOVE]
  }

  toString () {
    return 'key control'
  }
}

export default KeyMove
