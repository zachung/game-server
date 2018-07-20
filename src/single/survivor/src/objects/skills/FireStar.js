import { Container } from '../../lib/PIXI'
import Skill from './Skill'
import Texture from '../../lib/Texture'
import Bullet from '../Bullet'
import Vector from '../../lib/Vector'
import { ABILITY_ROTATE } from '../../config/constants'
import { calcApothem } from '../../lib/utils'

const PI2 = Math.PI * 2
const levels = [
  // cost, boltCount, hp, reactForce, speed, damage, force, scale
  [0.8, 8, 1, 6, 1, 0.01],
  [0.8, 16, 3, 10, 3, 5, 2]
]

class FireStar extends Skill {
  sprite () {
    let container = new Container()
    let bullets = []
    let [ , boltCount ] = levels[this.level]
    for (let rad = 0, maxRad = PI2; rad < maxRad; rad += PI2 / boltCount) {
      let bullet = Skill.sprite(Texture.Bullet)
      bullet.anchor.set(0.3, 0.5)
      bullet.rotation = rad
      bullet.position.set(bullet.width * 0.7, bullet.width * 0.7)
      bullets.push(bullet)
    }

    container.addChild(...bullets)

    return container
  }

  // 建立實體並釋放
  cast ({caster, rad = undefined}) {
    let [ cost, boltCount, hp, speed = 1, damage = 1, force = 0, scale = 1 ] = levels[this.level]
    if (!this._cost(caster, cost)) {
      return
    }

    for (let rad = 0, maxRad = PI2; rad < maxRad; rad += PI2 / boltCount) {
      let bullet = new Bullet({speed, damage, force, hp})
      bullet.scale.set(scale)
      this._genBullet(caster, bullet, rad)
    }
  }

  _genBullet (caster, bullet, rad) {
    // set direction
    if (rad === undefined) {
      // 如果沒指定方向，就用目前面對方向
      let rotateAbility = caster[ABILITY_ROTATE]
      rad = rotateAbility ? rotateAbility.faceRad : 0
    }
    let vector = Vector.fromRadLength(rad, 1)
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
    })

    caster.emit('addObject', bullet)
  }

  toString () {
    return 'FireStar'
  }
}

export default FireStar
