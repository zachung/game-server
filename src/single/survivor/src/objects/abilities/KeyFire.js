import Ability from './Ability'
import { ABILITY_FIRE, ABILITY_KEY_FIRE } from '../../config/constants'
import globalEventManager from '../../lib/globalEventManager'

const KEYS = Symbol('keys')

class KeyFire extends Ability {
  get type () { return ABILITY_KEY_FIRE }

  isBetter (other) {
    return false
  }

  // 配備此技能
  carryBy (owner) {
    super.carryBy(owner)
    owner[ABILITY_KEY_FIRE] = this
    this.setup(owner)
  }

  setup (owner) {
    let fireAbility = owner[ABILITY_FIRE]
    let mouseHandler = e => {
      if (e.stopped) {
        return
      }
      globalEventManager.emit('fire')
    }
    let fireHandler = fireAbility.fire.bind(fireAbility)

    owner[KEYS] = {
      mousedown: mouseHandler,
      fire: fireHandler
    }
    Object.entries(owner[KEYS]).forEach(([eventName, handler]) => {
      globalEventManager.on(eventName, handler)
    })
  }

  dropBy (owner) {
    super.dropBy(owner)
    Object.entries(owner[KEYS]).forEach(([eventName, handler]) => {
      globalEventManager.off(eventName, handler)
    })
    delete owner[KEYS]
    delete owner[ABILITY_KEY_FIRE]
  }

  toString () {
    return 'key fire'
  }
}

export default KeyFire
