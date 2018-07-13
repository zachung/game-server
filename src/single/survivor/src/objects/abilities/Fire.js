import Ability from './Ability'
import { ABILITY_FIRE, ABILITY_CARRY } from '../../config/constants'
import Bullet from '../Bullet'

const MOUSEMOVE = Symbol('mousemove')

class Fire extends Ability {
  constructor ([ speed, power ]) {
    super()
    this.speed = speed
    // TODO: implement
    this.power = power
  }

  get type () { return ABILITY_FIRE }

  carryBy (owner) {
    super.carryBy(owner)
    this.owner = owner
    owner[ABILITY_FIRE] = this
    owner.interactive = true
    owner[MOUSEMOVE] = e => {
      this.targetPosition = e.data.getLocalPosition(owner)
    }
    owner.on('mousemove', owner[MOUSEMOVE])
  }

  fire () {
    let owner = this.owner
    let scale = owner.scale.x

    let carryAbility = owner[ABILITY_CARRY]
    let BulletType = carryAbility.getItemByType(Bullet)
    if (!BulletType) {
      // no more bullet in inventory
      console.log('no more bullet in inventory')
      return
    }
    let bullet = new BulletType.constructor(this.speed)

    bullet.position.set(owner.x + owner.width / 2, owner.y + owner.height / 2)
    bullet.scale.set(scale, scale)
    bullet.setDirection(this.targetPosition)

    owner.emit('fire', bullet)
  }

  toString () {
    return 'place'
  }
}

export default Fire
