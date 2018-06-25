class Zombie extends Ball {
  constructor (options) {
    const defaults = {
      x: 0,
      y: 0,
      width: 128,
      height: 128,
      image: 'zombie',
      speed: 256,
      directRadians: 0,
      hp: 1,
      damage: 1,
      defence: 0
    }
    const populated = Object.assign(defaults, options)
    super(populated)
    this.speed *= Math.random() * 0.8 + 0.2
  }
  faceTo (x, y) {
    this.directRadians = Math.atan2(y - this.y, x - this.x)
  }
  run (dt) {
    this.x += Math.cos(this.directRadians) * this.speed * dt
    this.y += Math.sin(this.directRadians) * this.speed * dt
  }
  render (app) {
    app.layer.drawImage(app.images[this.image], this.x, this.y, this.width, this.height)
  }
}
