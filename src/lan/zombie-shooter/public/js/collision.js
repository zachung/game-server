var CollisionDetection = function () {
  this.collidingRecord = []
  this.collidingDelay = 0 // ms
  this.CircleRectColliding = function (circle, rect) {
    // delay
    if (this.collidingRecord[circle] &&
      this.collidingRecord[circle].with === rect &&
      (new Date()).getTime() < this.collidingRecord[circle].time.getTime() + this.collidingDelay) {
      return false
    }
    var distX = Math.abs(circle.x - rect.x - rect.width / 2)
    var distY = Math.abs(circle.y - rect.y - rect.height / 2)

    if (distX > (rect.width / 2 + circle.radius)) { return false }
    if (distY > (rect.height / 2 + circle.radius)) { return false }

    if (distX <= (rect.width / 2)) { return true }
    if (distY <= (rect.height / 2)) { return true }

    var dx = distX - rect.width / 2
    var dy = distY - rect.height / 2
    var isCollision = (dx * dx + dy * dy <= (circle.radius * circle.radius))
    if (isCollision) {
      this.collidingRecord[circle] = {
        with: rect,
        time: new Date()
      }
    }
    return isCollision
  }
  this.RectRectColliding = function (rect1, rect2) {
    if (rect1.x < rect2.x + rect2.width &&
      rect1.x + rect1.width > rect2.x &&
      rect1.y < rect2.y + rect2.height &&
      rect1.height + rect1.y > rect2.y) {
      // collision detected!
      return true
    }
    return false
  }
  this.RectPointColliding = function (rect, point) {
    if (rect.x <= point.x &&
      rect.x + rect.width >= point.x &&
      rect.y <= point.y &&
      rect.height + rect.y >= point.y) {
      // collision detected!
      return true
    }
    return false
  }
}

// server side
if (typeof global !== 'undefined') {
  module.exports = CollisionDetection
}
