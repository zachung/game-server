import Ability from './Ability'
import { ABILITY_MANA } from '../../config/constants'

class Mana extends Ability {
  constructor (value = 1, refill = 0.05) {
    super()
    this.value = value
    this.valueMax = value
    this.refill = refill
  }

  get type () { return ABILITY_MANA }

  carryBy (owner) {
    super.carryBy(owner)
    this.owner = owner
    owner[ABILITY_MANA] = this
  }

  isEnough (value) {
    return this.value - value >= 0
  }

  reduce (value) {
    this.value = Math.max(this.value - value, 0)
    this.owner.emit('mana-change')
  }

  add (value) {
    this.value = Math.min(this.value + value, this.valueMax)
    this.owner.emit('mana-change')
  }

  tick (delta) {
    this.add(this.refill * delta)
  }

  toString () {
    return [
      'Mana: ',
      this.value,
      ' / ',
      this.valueMax
    ].join('')
  }
}

export default Mana
