import Ability from './Ability'
import { ABILITY_FIRE, ABILITY_CARRY, ABILITY_ROTATE } from '../../config/constants'
import Bullet from '../Bullet'
import Vector from '../../lib/Vector'

class Fire extends Ability {
  constructor ([ power ]) {
    super()
    // TODO: implement
    this.power = power
  }

  get type () { return ABILITY_FIRE }

  carryBy (owner) {
    super.carryBy(owner)
    this.owner = owner
    owner[ABILITY_FIRE] = this
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
    let bullet = new BulletType.constructor()

    bullet.position.set(owner.x, owner.y)
    bullet.scale.set(scale, scale)

    // set direction
    let rotateAbility = owner[ABILITY_ROTATE]
    let rad = rotateAbility ? rotateAbility.faceRad : 0
    bullet.setDirection(Vector.fromRadLength(rad, 1))

    owner.emit('fire', bullet)
  }

  toString () {
    return 'place'
  }
}

export default Fire
