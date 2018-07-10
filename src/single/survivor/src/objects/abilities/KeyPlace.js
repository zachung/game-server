import Ability from './Ability'
import keyboardJS from 'keyboardjs'
import { PLACE1, PLACE2, PLACE3, PLACE4 } from '../../config/control'
import { ABILITY_PLACE, ABILITY_KEY_PLACE } from '../../config/constants'

const SLOTS = [
  PLACE1, PLACE2, PLACE3, PLACE4
]

class KeyPlace extends Ability {
  get type () { return ABILITY_KEY_PLACE }

  isBetter (other) {
    return false
  }

  // 配備此技能
  carryBy (owner) {
    super.carryBy(owner)
    this.setup(owner)
  }

  setup (owner) {
    let placeAbility = owner[ABILITY_PLACE]
    let bind = key => {
      let slotInx = SLOTS.indexOf(key)
      let handler = e => {
        e.preventRepeat()
        placeAbility.place(slotInx)
      }
      keyboardJS.bind(key, handler, () => {})
      return handler
    }

    keyboardJS.setContext('')
    keyboardJS.withContext('', () => {
      owner[ABILITY_KEY_PLACE] = {
        PLACE1: bind(PLACE1),
        PLACE2: bind(PLACE2),
        PLACE3: bind(PLACE3),
        PLACE4: bind(PLACE4)
      }
    })
  }

  dropBy (owner) {
    super.dropBy(owner)
    keyboardJS.withContext('', () => {
      Object.entries(owner[ABILITY_KEY_PLACE]).forEach(([key, handler]) => {
        keyboardJS.unbind(key, handler)
      })
    })
    delete owner[ABILITY_KEY_PLACE]
  }

  toString () {
    return 'key place'
  }
}

export default KeyPlace
