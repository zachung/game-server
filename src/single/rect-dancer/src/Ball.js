class Ball {
  constructor () {
    this.x = 0
    this.y = 0
    this.width = 32
    this.height = 32
    this.color = '#e2543e'
    this.speed = 256
    this.directRadians = 0
  }

  faceTo (x, y) {
    this.directRadians = Math.atan2(y - this.y, x - this.x)
  }

  run (dt) {
    this.x += Math.cos(this.directRadians) * this.speed * dt
    this.y += Math.sin(this.directRadians) * this.speed * dt
  }
}

export default Ball
