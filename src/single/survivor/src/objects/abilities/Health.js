import Ability from './Ability'
import { ABILITY_HEALTH } from '../../config/constants'

class Health extends Ability {
  constructor (hp = 1) {
    super()
    this.hp = hp
    this.hpMax = hp
  }

  get type () { return ABILITY_HEALTH }

  carryBy (owner) {
    super.carryBy(owner)
    this.owner = owner
    owner[ABILITY_HEALTH] = this
  }

  getHurt (hurt) {
    let preHp = this.hp
    this.hp -= hurt.damage
    let sufHp = this.hp
    this.owner.say([
      this.owner.toString(),
      ' get hurt ',
      hurt.damage,
      ': ',
      preHp,
      ' -> ',
      sufHp
    ].join(''))
    this.owner.emit('health-change')
    if (this.hp <= 0) {
      this.owner.emit('die')
    }
  }

  toString () {
    return [
      'Health: ',
      this.hp,
      ' / ',
      this.hpMax
    ].join('')
  }
}

export default Health
