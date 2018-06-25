var ENGINE = {}

let f = (x, y) => {
  let msq = Math.sqrt(x * x + y * y)
  return 4 * Math.sin(msq) / msq
}

let Rx = (theta) => {
  return [
    [1, 0, 0],
    [0, Math.cos(theta), -Math.sin(theta)],
    [0, Math.sin(theta), Math.cos(theta)]
  ]
}

let Ry = (theta) => {
  return [
    [Math.cos(theta), 0, Math.sin(theta)],
    [0, 1, 0],
    [-Math.sin(theta), 0, Math.cos(theta)]
  ]
}

let Rz = (theta) => {
  return [
    [Math.cos(theta), -Math.sin(theta), 0],
    [Math.sin(theta), Math.cos(theta), 0],
    [0, 0, 1]
  ]
}

let direct = 0b00000

class Point {
  constructor (x, y, z) {
    this.o = {
      x: x,
      y: y,
      z: z
    }
    this.data = {
      x: x,
      y: y,
      z: z
    }
  }
  rotate (R) {
    this.data.x = R[0][0] * this.data.x + R[0][1] * this.data.y + R[0][2] * this.data.z
    this.data.y = R[1][0] * this.data.x + R[1][1] * this.data.y + R[1][2] * this.data.z
    this.data.z = R[2][0] * this.data.x + R[2][1] * this.data.y + R[2][2] * this.data.z
  }
  get x () {
    return this.data.x
  }
  get y () {
    return this.data.y
  }
  get z () {
    return this.data.z
  }
}

ENGINE.Game = {

  lines: [],

  points: [],

  pointsIndex: [],

  create: function () {
    let game = this
  },

  enter: function () {
    let app = this.app
    let center = app.center
    this.lines.push([new Point(-center.x, 0, 0), new Point(center.x, 0, 0)])
    this.lines.push([new Point(0, -center.y, 0), new Point(0, center.y, 0)])
    this.lines.push([new Point(0, 0, -center.x), new Point(0, 0, center.x)])

    let unit = 20
    let gl = 10
    // x-axis with y unit
    for (let x = unit; x < center.x; x += unit) {
      this.lines.push([new Point(x, -gl, 0), new Point(x, gl, 0)])
      this.lines.push([new Point(-x, -gl, 0), new Point(-x, gl, 0)])
    }
    // y-axis with z unit
    for (let y = unit; y < center.y; y += unit) {
      this.lines.push([new Point(0, y, -gl), new Point(0, y, gl)])
      this.lines.push([new Point(0, -y, -gl), new Point(0, -y, gl)])
    }
    // z-axis with x unit
    for (let z = unit; z < center.x; z += unit) {
      this.lines.push([new Point(-gl, 0, z), new Point(gl, 0, z)])
      this.lines.push([new Point(-gl, 0, -z), new Point(gl, 0, -z)])
    }

    for (let x = -9; x <= 9; x += 0.2) {
      for (let y = -9; y <= 9; y += 0.2) {
        let p = new Point(x, y, f(x, y))
        p.color = '#44' + (p.z / 10 + 0.5).toString(16).slice(2, 4) + '44'
        this.pointsIndex.push(p)
        this.points.push(p)
      }
    }
  },

  step: function (dt) {
    let step = 0.02
    let ctrl = direct >> 4 & 1
    let dx = step * ((direct >> 2 & 1) - (direct >> 3 & 1))
    let dy = step * ((direct >> 0 & 1) - (direct >> 1 & 1))

    if (dx != 0) {
      this.rotate(Rx(dx))
    }
    if (dy != 0) {
      if (!ctrl) {
        this.rotate(Ry(dy))
      } else {
        this.rotate(Rz(dy))
      }
    }
  },

  rotate (R) {
    for (let p of this.points) {
      p.rotate(R)
    }
    this.points.sort((p1, p2) => p1.z - p2.z)
  },

  render: function (dt) {
    let app = this.app
    let layer = app.layer
    let center = app.center

    layer.save()
    layer.clear('#FFF')
    layer.setTransform(1, 0, 0, -1, center.x, center.y)

    // grid
    let y = center.y
    for (let line of this.lines) {
      layer.strokeLine(line[0], line[1])
    }

    // render points
    // for (let point of this.points) {
    //   layer.fillStyle(point.color);
    //   layer.fillRect(point.x * 84, point.y * 84, 20, 20);
    // }

    // render surface
    let
      P = this.points,
      PI = this.pointsIndex,
      L = P.length,
      l = Math.sqrt(P.length),
      d = 5
    for (let i = 0; i < L; i++) {
      let
        p = P[i],
        j = PI.indexOf(p)
      if (j % l % d === 0 && parseInt(j / l) % d === 0 && // up left corner
        (l - j % l > d) && (l - parseInt(j / l) > d)
      ) {
        let
          p2 = PI[j + d],
          p3 = PI[j + d * (l + 1)],
          p4 = PI[j + d * l]
        layer.fillStyle('#44' + ((p.o.z + p2.o.z + p3.o.z + p4.o.z) / 40 + 0.5).toString(16).slice(2, 4) + '44')
        layer
          .beginPath()
          .moveTo(p.x * 84, p.y * 84)
          .lineTo(p2.x * 84, p2.y * 84)
          .lineTo(p3.x * 84, p3.y * 84)
          .lineTo(p4.x * 84, p4.y * 84)
          .closePath()
          .fill()
      }
    }

    // y = sin(x);
    // let o = new Point(-center.x, 0, 0);
    // layer.strokeStyle("#44A").beginPath().moveTo(o.x, o.y);
    // for (let x = -center.x; x < center.x; x++) {
    //   let tmp = new Point(x, Math.sin(x/180*Math.PI) * 100, 0);
    //   layer.lineTo(tmp.x, tmp.y);
    // }
    // layer.stroke();

    // (x^2 + 9/4*y^2 + z^2 - 1)^3 - x^2 * Z^3 - 9/80 * y^2 * z^3 = 0
    layer.restore()
  },

  keydown: function (data) {
    switch (data.key) {
      case 'ctrl':
        direct |= 0b10000
        break
      case 'left':
        direct |= 0b00010
        break
      case 'right':
        direct |= 0b00001
        break
      case 'up':
        direct |= 0b01000
        break
      case 'down':
        direct |= 0b00100
        break
    }
  },

  keyup: function (data) {
    switch (data.key) {
      case 'ctrl':
        direct &= 0b01111
        break
      case 'left':
        direct &= 0b11101
        break
      case 'right':
        direct &= 0b11110
        break
      case 'up':
        direct &= 0b10111
        break
      case 'down':
        direct &= 0b11011
        break
    }
  }

}

module.exports = ENGINE
