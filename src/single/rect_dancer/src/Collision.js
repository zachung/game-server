class CollisionDetection {
  constructor () {
    this.collidingRecord = []
    this.collidingDelay = 1000 // ms
  }

  CircleRectColliding (circle, rect) {
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

  RectRectColliding (rect1, rect2) {
    if (rect1.x < rect2.x + rect2.width &&
      rect1.x + rect1.width > rect2.x &&
      rect1.y < rect2.y + rect2.height &&
      rect1.height + rect1.y > rect2.y) {
      // collision detected!
      return true
    }
    return false
  }

  RectPointColliding (rect, point) {
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

export default CollisionDetection
