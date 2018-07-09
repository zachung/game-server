import Ability from './Ability'
import { ABILITY_CARRY } from '../../config/constants'
import Torch from '../../items/Torch'

class Carry extends Ability {
  constructor (initSlots) {
    super()
    this.bags = []
    this.bags.push(Array(initSlots))
    this.bags[0][0] = new Torch(1)
  }

  get type () { return ABILITY_CARRY }

  carryBy (owner) {
    super.carryBy(owner)
  }

  toString () {
    return ['carry: ', this.bags.join(', ')].join('')
  }
}

export default Carry
