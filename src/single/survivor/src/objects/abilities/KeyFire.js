import Ability from './Ability'
import keyboardJS from 'keyboardjs'
import { FIRE } from '../../config/control'
import { ABILITY_FIRE, ABILITY_KEY_FIRE } from '../../config/constants'

class KeyFire extends Ability {
  get type () { return ABILITY_KEY_FIRE }

  isBetter (other) {
    return false
  }

  // 配備此技能
  carryBy (owner) {
    super.carryBy(owner)
    this.setup(owner)
  }

  setup (owner) {
    let fireAbility = owner[ABILITY_FIRE]
    let bind = key => {
      let handler = e => {
        e.preventRepeat()
        fireAbility.fire()
      }
      keyboardJS.bind(key, handler, () => {})
      return handler
    }

    keyboardJS.setContext('')
    keyboardJS.withContext('', () => {
      owner[ABILITY_KEY_FIRE] = {
        FIRE: bind(FIRE)
      }
    })
  }

  dropBy (owner) {
    super.dropBy(owner)
    keyboardJS.withContext('', () => {
      Object.entries(owner[ABILITY_KEY_FIRE]).forEach(([key, handler]) => {
        keyboardJS.unbind(key, handler)
      })
    })
    delete owner[ABILITY_KEY_FIRE]
  }

  toString () {
    return 'key fire'
  }
}

export default KeyFire
