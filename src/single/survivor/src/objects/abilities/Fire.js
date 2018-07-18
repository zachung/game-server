import Ability from './Ability'
import { ABILITY_FIRE, ABILITY_CARRY, ABILITY_ROTATE } from '../../config/constants'
import Bullet from '../Bullet'
import Vector from '../../lib/Vector'

const PI = Math.PI

function calcApothem (o, rad) {
  let width = o.width / 2
  let height = o.height / 2
  let rectRad = Math.atan2(height, width)
  let len
  // 如果射出角穿過 width
  let r1 = Math.abs(rad % PI)
  let r2 = Math.abs(rectRad % PI)
  if (r1 < r2 || r1 > r2 + PI / 2) {
    len = width / Math.cos(rad)
  } else {
    len = height / Math.sin(rad)
  }
  return Math.abs(len)
}

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
    bullet.scaleEx.set(scale)
    bullet.setOwner(owner)

    // set position
    let rectLen = calcApothem(owner, rad + owner.rotation)
    let bulletLen = bullet.height / 2 // 射出角等於自身旋角，所以免去運算
    let len = rectLen + bulletLen
    let position = Vector.fromRadLength(rad, len)
      .add(Vector.fromPoint(owner.positionEx))
    bullet.positionEx.set(position.x, position.y)

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
