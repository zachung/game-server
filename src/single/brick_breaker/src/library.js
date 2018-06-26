class GameObject {
  constructor ({ x, y } = {}) {
    this.x = x || 0
    this.y = y || 0
    this.color = 'blue'
  }
}

export class Ball extends GameObject {
  constructor (options = {}) {
    super(options)
    this.vx = 5
    this.vy = -2
    this.r = options.r
    this.color = 'blue'
  }

  draw (canvas) {
    var ctx = canvas.getContext('2d')
    ctx.beginPath()
    ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2, true)
    ctx.closePath()
    ctx.fillStyle = this.color
    ctx.fill()
    // 如果下一個frame超出y
    if (this.y + this.vy > canvas.height - this.r || this.y + this.vy < this.r) {
      this.vy = -this.vy
    }
    if (this.x + this.vx > canvas.width - this.r || this.x + this.vx < this.r) {
      this.vx = -this.vx
    }
    this.x += this.vx
    this.y += this.vy
  }
}

export class Rect extends GameObject {
  constructor (options) {
    super(options)
    this.w = 40
    this.h = 15
    this.color = 'rgb(200,0,0)'
  }

  draw (canvas) {
    var ctx = canvas.getContext('2d')
    ctx.fillStyle = this.color
    ctx.fillRect(this.x, this.y, this.w, this.h)
  }
}

export const CollisionDetection = function () {
  this.collidingRecord = []
  this.collidingDelay = 1000 // ms
  this.CircleRectColliding = function (circle, rect) {
    // delay
    if (this.collidingRecord[circle] &&
      this.collidingRecord[circle].with === rect &&
      (new Date()).getTime() < this.collidingRecord[circle].time.getTime() + this.collidingDelay) {
      return false
    }
    var distX = Math.abs(circle.x - rect.x - rect.w / 2)
    var distY = Math.abs(circle.y - rect.y - rect.h / 2)

    if (distX > (rect.w / 2 + circle.r)) { return false }
    if (distY > (rect.h / 2 + circle.r)) { return false }

    if (distX <= (rect.w / 2)) { return true }
    if (distY <= (rect.h / 2)) { return true }

    var dx = distX - rect.w / 2
    var dy = distY - rect.h / 2
    var isCollision = (dx * dx + dy * dy <= (circle.r * circle.r))
    if (isCollision) {
      this.collidingRecord[circle] = {
        with: rect,
        time: new Date()
      }
    }
    return isCollision
  }
}
