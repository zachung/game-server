import Ball from './Ball'

class Bullet extends Ball {
  constructor (options) {
    const defaults = {
      x: 0,
      y: 0,
      width: 10,
      height: 10,
      color: '#ff0000',
      speed: 1024,
      directRadians: 0,
      damage: 1,
      hp: 1 // can go throw somebody
    }
    const populated = Object.assign(defaults, options)
    super(populated)
  }
  render (layer) {
    layer
      .fillStyle(this.color)
      .fillRect(this.x, this.y, this.width, this.height)
  }
}

export default Bullet
