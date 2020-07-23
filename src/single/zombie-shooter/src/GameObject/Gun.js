import CollisionDetection from '../Collision'
import Engine from '../Engine'

import Bullet from './Bullet'

var collisionDetection = new CollisionDetection()

class Gun {
  constructor (options) {
    const defaults = {
      maxRadius: 0,
      colddown: 0,
      toRadians: Math.asin(-1)
    }
    const populated = Object.assign(defaults, options)
    for (const key in populated) {
      if (populated.hasOwnProperty(key)) {
        this[key] = populated[key]
      }
    }
    this.bullets = []
    this.nextshoot = 0
  }
  faceTo (toRadians) {
    this.toRadians = toRadians
  }
  attack (fromX, fromY, dt) {
    if (this.nextshoot > 0) {
      this.nextshoot -= dt
      return
    }
    var bullets = this.bullets
    var bullet = new Bullet({
      x: fromX,
      y: fromY,
      directRadians: this.toRadians
    })
    bullets.push(bullet)
    // bullet out of screen
    var bulletsIndex = bullets.length - 1
    while (bulletsIndex >= 0) {
      var bullet = bullets[bulletsIndex]
      if (bullet.x > this.maxRadius || bullet.y > this.maxRadius) {
        bullets.splice(bulletsIndex, 1)
      }
      bulletsIndex -= 1
    }
    this.nextshoot = this.colddown
    return bullet
  }
  step (enemies, dt) {
    var bullets = this.bullets
    bullets.forEach(function (bullet) {
      bullet.run(dt)
      enemies.forEach(function (enemy) {
        if (collisionDetection.RectRectColliding(bullet, enemy)) {
          console.log('hit monster')
          // add score
          Engine.score.add(Engine.levelData.scorePreHit)
          Engine.score.save()
          // bullet die
          if (!bullet.getDamage(enemy.defence)) {
            bullets.splice(bullets.indexOf(bullet), 1)
          }
          // enemy get damage
          if (!enemy.getDamage(bullet.damage)) {
            // enemy die
            enemies.splice(enemies.indexOf(enemy), 1)
          }
        }
      })
    })
  }
  render (layer) {
    this.bullets.forEach(function (bullet) {
      bullet.render(layer)
    })
  }
  upgrade (type, value, isMultiply) {
    if (!isMultiply) {
      this[type] += value
    } else {
      this[type] *= value
    }
  }
}

export default Gun
