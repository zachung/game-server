import Ability from './Ability'
import keyboardJS from 'keyboardjs'
import { LEFT, UP, RIGHT, DOWN } from '../../config/control'
import { ABILITY_MOVE, ABILITY_KEY_MOVE } from '../../config/constants'
import Vector from '../../lib/Vector'

const KEYS = Symbol('keys')

class KeyMove extends Ability {
  get type () { return ABILITY_KEY_MOVE }

  isBetter (other) {
    return false
  }

  // 配備此技能
  carryBy (owner) {
    super.carryBy(owner)
    owner[ABILITY_KEY_MOVE] = this
    this.setup(owner)
  }

  setup (owner) {
    let dir = {}
    let calcDir = () => {
      let vector = new Vector(-dir[LEFT] + dir[RIGHT], -dir[UP] + dir[DOWN])
      if (vector.length === 0) {
        return
      }
      vector.multiplyScalar(0.17)
      owner[ABILITY_MOVE].addDirection(vector)
    }
    let bind = code => {
      dir[code] = 0
      let preHandler = e => {
        e.preventRepeat()
        dir[code] = 1
        owner[ABILITY_MOVE].clearPath()
      }
      keyboardJS.bind(code, preHandler, () => {
        dir[code] = 0
      })
      return preHandler
    }

    keyboardJS.setContext('')
    keyboardJS.withContext('', () => {
      owner[KEYS] = {
        [LEFT]: bind(LEFT),
        [UP]: bind(UP),
        [RIGHT]: bind(RIGHT),
        [DOWN]: bind(DOWN)
      }
    })

    this.timer = setInterval(calcDir, 17)
  }

  dropBy (owner) {
    super.dropBy(owner)
    keyboardJS.withContext('', () => {
      Object.entries(owner[KEYS]).forEach(([key, handler]) => {
        keyboardJS.unbind(key, handler)
      })
    })
    delete owner[KEYS]
    delete owner[ABILITY_KEY_MOVE]

    clearInterval(this.timer)
  }

  toString () {
    return 'key control'
  }
}

export default KeyMove
