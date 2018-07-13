const degrees = 180 / Math.PI

class Vector {
  constructor (x, y) {
    this.x = x
    this.y = y
  }

  static fromPoint (p) {
    return new Vector(p.x, p.y)
  }

  static fromDegLength (deg, length) {
    let x = length * Math.cos(deg)
    let y = length * Math.sin(deg)
    return new Vector(x, y)
  }

  clone () {
    return new Vector(this.x, this.y)
  }

  add (v) {
    this.x += v.x
    this.y += v.y
    return this
  }

  sub (v) {
    this.x -= v.x
    this.y -= v.y
    return this
  }

  invert () {
    return this.multiplyScalar(-1)
  }

  multiplyScalar (s) {
    this.x *= s
    this.y *= s
    return this
  }

  divideScalar (s) {
    if (s === 0) {
      this.x = 0
      this.y = 0
    } else {
      return this.multiplyScalar(1 / s)
    }
    return this
  }

  dot (v) {
    return this.x * v.x + this.y * v.y
  }

  get length () {
    return Math.sqrt(this.x * this.x + this.y * this.y)
  }

  lengthSq () {
    return this.x * this.x + this.y * this.y
  }

  normalize () {
    return this.divideScalar(this.length)
  }

  distanceTo (v) {
    return Math.sqrt(this.distanceToSq(v))
  }

  distanceToSq (v) {
    let dx = this.x - v.x
    let dy = this.y - v.y
    return dx * dx + dy * dy
  }

  set (x, y) {
    this.x = x
    this.y = y
    return this
  }

  setX (x) {
    this.x = x
    return this
  }

  setY (y) {
    this.y = y
    return this
  }

  setLength (l) {
    var oldLength = this.length
    if (oldLength !== 0 && l !== oldLength) {
      this.multiplyScalar(l / oldLength)
    }
    return this
  }

  lerp (v, alpha) {
    this.x += (v.x - this.x) * alpha
    this.y += (v.y - this.y) * alpha
    return this
  }

  rad () {
    return Math.atan2(this.y, this.x)
  }

  get deg () {
    return this.rad() * degrees
  }

  equals (v) {
    return this.x === v.x && this.y === v.y
  }

  rotate (theta) {
    var xtemp = this.x
    this.x = this.x * Math.cos(theta) - this.y * Math.sin(theta)
    this.y = xtemp * Math.sin(theta) + this.y * Math.cos(theta)
    return this
  }
}

export default Vector
