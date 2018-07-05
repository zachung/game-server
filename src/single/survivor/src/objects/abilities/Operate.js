import Ability from './Ability'
import { ABILITY_OPERATE } from '../../config/constants'

class Operate extends Ability {
  constructor (value) {
    super()
    this.set = new Set([value])
  }

  get type () { return ABILITY_OPERATE }

  replacedBy (other) {
    this.set.forEach(other.set.add.bind(other.set))
  }

  use (operator, target) {
    if (this.set.has(target.map)) {
      operator.say(operator.toString() + ' use ability to open ' + target.map)
      target[this.type]()
    }
  }

  toString () {
    return ['keys: ', Array.from(this.set).join(', ')].join('')
  }
}

export default Operate
