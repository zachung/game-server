class ScrollingBackground {
  constructor (image) {
    this.backgrounds = []
    this.bw = image.width
    this.bh = image.height
    this.layer = {}
    this.directRadians = Math.asin(-1)
  }

  move (speed) {
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
    let nx = Math.ceil(w / this.bw) + 1
    let ny = Math.ceil(h / this.bh) + 1
    for (let i = -1; i <= nx; i++) {
      for (let j = -1; j <= ny; j++) {
        this.backgrounds.push([i * this.bw, j * this.bh])
      }
    }
  }

  render (app) {
    this.backgrounds.forEach(function (e) {
      app.layer.drawImage(app.images.background, e[0], e[1])
    })
  }
}

export default ScrollingBackground
