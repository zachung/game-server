import Ability from './Ability'
import { ABILITY_HEALTH } from '../../config/constants'

class Health extends Ability {
  constructor (healthPoint = 1) {
    super()
    this.healthPoint = healthPoint
    this.mapHealthPoint = healthPoint
  }

  get type () { return ABILITY_HEALTH }

  carryBy (owner) {
    super.carryBy(owner)
    this.owner = owner
    owner[ABILITY_HEALTH] = this
  }

  getHurt (hurt) {
    let preHp = this.healthPoint
    this.healthPoint -= hurt.damage
    let sufHp = this.healthPoint
    this.owner.say([
      this.owner.toString(),
      ' get hurt ',
      hurt.damage,
      ': ',
      preHp,
      ' -> ',
      sufHp
    ].join(''))
    if (this.healthPoint <= 0) {
      this.owner.emit('die')
    }
  }

  toString () {
    return 'Health'
  }
}

export default Health
