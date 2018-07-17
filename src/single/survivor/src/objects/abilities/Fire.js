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

  fire (rad = undefined) {
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

    // set direction
    if (rad === undefined) {
      // 如果沒指定方向，就用目前面對方向
      let rotateAbility = owner[ABILITY_ROTATE]
      rad = rotateAbility ? rotateAbility.faceRad : 0
    }
    let vector = Vector.fromRadLength(rad, 1)
    bullet.scale.set(scale, scale)
    bullet.setOwner(owner)
    bullet.anchor.set(0.5, 0.5)

    // set position
    let anchor = owner.anchor
    let position = vector.clone()
      .multiplyScalar(owner.width / 2 + bullet.width / 2)
      .add(new Vector(
        owner.x + owner.width * (0.5 - anchor.x),
        owner.y + owner.height * (0.5 - anchor.y)
      ))
    bullet.position.set(position.x, position.y)
    bullet.once('added', () => {
      bullet.setDirection(vector)
    })

    owner.emit('fire', bullet)
  }

  toString () {
    return 'Fire'
  }
}

export default Fire
