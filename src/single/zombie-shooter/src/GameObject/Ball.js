class Ball {
  constructor (options) {
    const defaults = {
      x: 0,
      y: 0,
      width: 32,
      height: 32,
      color: '#e2543e',
      speed: 256,
      directRadians: 0,
      hp: 1,
      damage: 0,
      defence: 0
    }
    const populated = Object.assign(defaults, options)
    for (const key in populated) {
      if (populated.hasOwnProperty(key)) {
        this[key] = populated[key]
      }
    }
  }
  faceTo (x, y) {
    this.directRadians = Math.atan2(y - this.y, x - this.x)
  }
  run (dt) {
    this.x += Math.cos(this.directRadians) * this.speed * dt
    this.y += Math.sin(this.directRadians) * this.speed * dt
  }
  /**
   * Gets the damage.
   *
   * @param      {number}  damage  The damage
   * @return     {boolean}  still alive
   */
  getDamage (damage) {
    this.hp -= damage
    return this.hp > 0
  }
  render (layer) {
    layer
      .fillStyle(this.color)
      .fillRect(this.x, this.y, this.width, this.height)
  }
}

export default Ball
