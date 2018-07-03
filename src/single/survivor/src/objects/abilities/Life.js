import { ABILITY_LIFE } from '../../config/constants'

// TODO: trigger owner die
class Life {
  constructor (maxHp) {
    this.maxHp = maxHp
    this.currentHp = maxHp
  }

  get type () { return ABILITY_LIFE }

  // 是否需置換
  hasToReplace (owner) {
    let ability = owner.abilities[this.type]
    if (!ability) {
      return true
    }
    return this.maxHp > ability.maxHp
  }

  // 配備此技能
  carryBy (owner) {
    owner.abilities[this.type] = this
  }

  dropBy (owner) {
    delete owner.abilities[this.type]
  }

  toString () {
    return ['keys: ', Array.from(this.set).join(', ')].join('')
  }
}

export default Life
