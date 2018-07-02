import { OPERATE } from '../../config/constants'

class Operate {
  constructor (value) {
    this.type = OPERATE
    this.set = new Set([value])
  }

  // 是否需置換
  hasToReplace (owner) {
    return true
  }

  // 配備此技能
  carryBy (owner) {
    let ability = owner.abilities[this.type]
    if (!ability) {
      // first get operate ability
      ability = this
      owner.abilities[this.type] = ability
      return
    }
    let set = ability.set
    this.set.forEach(set.add.bind(set))
  }

  use (operator, target) {
    if (operator.abilities[this.type].set.has(target.map)) {
      operator.say(operator.toString() + ' use ability to open ' + target.map)
      target[this.type]()
    }
  }

  toString () {
    return ['keys: ', Array.from(this.set).join(', ')].join('')
  }
}

export default Operate
