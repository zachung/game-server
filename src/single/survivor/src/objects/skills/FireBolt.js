import Skill from './Skill'
import Texture from '../../lib/Texture'
import Bullet from '../Bullet'
import Vector from '../../lib/Vector'
import { ABILITY_ROTATE, ABILITY_MOVE } from '../../config/constants'
import { calcApothem } from '../../lib/utils'

const levels = [
  // cost, hp, reactForce, speed, damage, force, scale
  [0.2, 1, 0.001, 6, 1, 0.01],
  [2, 3, 0.005, 10, 3, 5, 2]
]

class FireBolt extends Skill {
  sprite () {
    return Skill.sprite(Texture.Bullet)
  }

  // 建立實體並釋放
  cast ({caster, rad = undefined}) {
    let [ cost, hp, reactForce, speed = 1, damage = 1, force = 0, scale = 1 ] = levels[this.level]
    if (!this._cost(caster, cost)) {
      return
    }
    let bullet = new Bullet({speed, damage, force, hp})

    // set direction
    if (rad === undefined) {
      // 如果沒指定方向，就用目前面對方向
      let rotateAbility = caster[ABILITY_ROTATE]
      rad = rotateAbility ? rotateAbility.faceRad : 0
    }
    let vector = Vector.fromRadLength(rad, 1)
    bullet.scale.set(scale)
    bullet.setOwner(caster)

    // set position
    let rectLen = calcApothem(caster, rad + caster.rotation)
    let bulletLen = bullet.height / 2 // 射出角等於自身旋角，所以免去運算
    let len = rectLen + bulletLen
    let position = Vector.fromRadLength(rad, len)
      .add(Vector.fromPoint(caster.positionEx))
    bullet.positionEx.set(position.x, position.y)

    bullet.once('added', () => {
      bullet.setDirection(vector)

      let moveAbility = caster[ABILITY_MOVE]
      if (moveAbility) {
        moveAbility.punch(vector.clone().setLength(reactForce).invert())
      }
    })

    caster.emit('addObject', bullet)
  }

  toString () {
    return 'FireBolt'
  }
}

export default FireBolt
