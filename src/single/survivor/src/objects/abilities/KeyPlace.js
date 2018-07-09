import Ability from './Ability'
import keyboardJS from 'keyboardjs'
import { PLACE } from '../../config/control'
import { ABILITY_PLACE, ABILITY_KEY_PLACE } from '../../config/constants'

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
    keyboardJS.setContext('')
    keyboardJS.withContext('', () => {
      owner[ABILITY_KEY_PLACE] = e => {
        e.preventRepeat()
        if (owner[ABILITY_PLACE]) {
          owner[ABILITY_PLACE].place()
        }
      }
      keyboardJS.bind(PLACE, owner[ABILITY_KEY_PLACE], () => {})
    })
  }

  dropBy (owner) {
    super.dropBy(owner)
    keyboardJS.withContext('', () => {
      keyboardJS.unbind(PLACE, owner[ABILITY_KEY_PLACE])
    })
    delete owner[ABILITY_KEY_PLACE]
  }

  toString () {
    return 'key place'
  }
}

export default KeyPlace
