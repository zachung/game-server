class ScrollingBackground {
  constructor (image) {
    this.backgrounds = []
    this.bw = image.width
    this.bh = image.height
    this.image = image
    this.layer = {}
    this.directRadians = Math.asin(-1)
    this.faceDirectBits = 0b0000 // LRUD
    this.dontMove = true
  }

  move (speed) {
    if (this.dontMove) {
      return [0, 0]
    }
    let dx = Math.cos(this.directRadians) * speed
    let dy = Math.sin(this.directRadians) * speed
    let lw = this.layer.w
    let lh = this.layer.h
    let nx = Math.ceil(lw / this.bw) + 1
    let ny = Math.ceil(lh / this.bh) + 1
    this.backgrounds.forEach(e => {
      e[0] -= dx
      e[1] -= dy
      if (e[0] < -this.bw) {
        e[0] += (nx + 1) * this.bw
      }
      if (e[0] > lw) {
        e[0] -= (nx + 1) * this.bw
      }
      if (e[1] < -this.bh) {
        e[1] += (ny + 1) * this.bh
      }
      if (e[1] > lh) {
        e[1] -= (ny + 1) * this.bh
      }
    })
    return [dx, dy]
  }
  init (w, h) {
    this.layer = {
      w: w,
      h: h
    }
    var nx = Math.ceil(w / this.bw) + 1
    var ny = Math.ceil(h / this.bh) + 1
    for (var i = -1; i <= nx; i++) {
      for (var j = -1; j <= ny; j++) {
        this.backgrounds.push([i * this.bw, j * this.bh])
      }
    }
  }
  _turn () {
    let x = 0
    let y = 0
    x -= (this.faceDirectBits >> 3) & 1 // L
    x += (this.faceDirectBits >> 2) & 1 // R
    y -= (this.faceDirectBits >> 1) & 1 // U
    y += (this.faceDirectBits >> 0) & 1 // D
    this.directRadians = Math.atan2(y, x)
    this.dontMove = x === 0 && y === 0
  }
  faceTo (direct) {
    this.faceDirectBits |= direct
    this._turn()
  }
  faceCancel (direct) {
    this.faceDirectBits &= direct
    this._turn()
  }
  render (app) {
    this.backgrounds.forEach(e => {
      app.layer.drawImage(this.image, e[0], e[1])
    })
  }
}

export default ScrollingBackground
