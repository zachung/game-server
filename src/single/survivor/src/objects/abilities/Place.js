import Ability from './Ability'
import { ABILITY_PLACE, ABILITY_CARRY } from '../../config/constants'

class Place extends Ability {
  get type () { return ABILITY_PLACE }

  carryBy (owner) {
    super.carryBy(owner)
    this.owner = owner
    owner[ABILITY_PLACE] = this
  }

  place () {
    let owner = this.owner
    let carryAbility = owner[ABILITY_CARRY]
    let item = carryAbility.getSlotItem(0)
    if (item) {
      owner.emit('place', new item.constructor())

      let position = owner.position
      owner.say(['place ', item.toString(), ' at ',
        ['(', position.x.toFixed(0), ', ', position.y.toFixed(0), ')'].join('')].join(''))
    }
  }

  toString () {
    return 'place'
  }
}

export default Place
