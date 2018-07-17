import Ability from './Ability'
import { ABILITY_FIRE, ABILITY_KEY_FIRE } from '../../config/constants'
import globalEventManager from '../../lib/globalEventManager'

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
    let mouseHandler = e => {
      if (e.stopped) {
        return
      }
      globalEventManager.emit('fire')
    }
    let fireHandler = fireAbility.fire.bind(fireAbility)

    owner[ABILITY_KEY_FIRE] = {
      mousedown: mouseHandler,
      fire: fireHandler
    }
    Object.entries(owner[ABILITY_KEY_FIRE]).forEach(([eventName, handler]) => {
      globalEventManager.on(eventName, handler)
    })
  }

  dropBy (owner) {
    super.dropBy(owner)
    Object.entries(owner[ABILITY_KEY_FIRE]).forEach(([eventName, handler]) => {
      globalEventManager.off(eventName, handler)
    })
    delete owner[ABILITY_KEY_FIRE]
  }

  toString () {
    return 'key fire'
  }
}

export default KeyFire
