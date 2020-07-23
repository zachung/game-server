const Graphic = require('../class/Graphic')
let defaults = {
  btnSize: 20,
  strokeWidth: 5
}

class Window extends Graphic {
  constructor (options) {
    const defaults = {
      backgroundColor: '#000',
      barColor: '#005',
      expendBtnColor: '#084',
      strokeColor: '#FFF',
      isExpend: true,
      noExpendBtn: false
    }
    const populated = Object.assign(defaults, options)
    super(populated)
  }
  get renderArea () {
    let strokeWidth = defaults.strokeWidth
    let btnSize = defaults.btnSize
    return {
      x: this.x + strokeWidth / 2,
      y: this.y + btnSize + strokeWidth / 2,
      width: this.width - strokeWidth,
      height: this.height - btnSize - strokeWidth
    }
  }
  onMousedown (point) {
    let btnSize = defaults.btnSize
    let isExpendBtn = Window.isInRect(point, {
      x: this.x,
      y: this.y,
      width: btnSize,
      height: btnSize
    })
    let isDragBar = Window.isInRect(point, {
      x: this.x,
      y: this.y,
      width: this.width,
      height: btnSize
    })
    let isInWindow = Window.isInRect(point, {
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height
    })
    if (isExpendBtn) {
      this.isExpend = !this.isExpend
      return false
    } else if (isDragBar) {
      this.isDrag = true
      this.dragPoint = {
        x: point.x - this.x,
        y: point.y - this.y
      }
      return false
    } else if (isInWindow) {
      this.mousedownInWindow(point)
      return false
    }
    return true
  }
  onMouseup (point) {
    this.isDrag = false
  }
  onMousemove (point) {
    if (this.isDrag) {
      this.x = point.x - this.dragPoint.x
      this.y = point.y - this.dragPoint.y
    }
  }
  renderWindow (app, renderArea) {
    // empty for subclass implements
  }
  mousedownInWindow (point) {
    // empty for subclass implements
  }
  render (app, deltaPoint = {x: 0, y: 0}) {
    let renderArea = this.renderArea
    if (this.noExpendBtn) {
      this.renderNoExpend(app, deltaPoint)
      this.renderWindow(app, deltaPoint)
    } else if (this.isExpend) {
      this.renderExpend(app, deltaPoint)
      this.renderWindow(app, deltaPoint)
    } else {
      this.renderClose(app, deltaPoint)
    }
  }
  renderNoExpend (app, deltaPoint) {
    let x = this.x + deltaPoint.x
    let y = this.y + deltaPoint.y
    let btnSize = defaults.btnSize
    app.layer
      .fillStyle(this.backgroundColor)
      .fillRect(x, y, this.width, this.height)
      .lineWidth(defaults.strokeWidth)
      .strokeStyle(this.strokeColor)
      .strokeRect(x, y, this.width, this.height)
  }
  renderExpend (app, deltaPoint) {
    let x = this.x + deltaPoint.x
    let y = this.y + deltaPoint.y
    let btnSize = defaults.btnSize
    app.layer
      .fillStyle(this.backgroundColor)
      .fillRect(x, y, this.width, this.height)
      .fillStyle(this.barColor)
      .fillRect(x, y, this.width, btnSize)
      .fillStyle(this.expendBtnColor)
      .fillRect(x, y, btnSize, btnSize)
      .lineWidth(defaults.strokeWidth)
      .strokeStyle(this.strokeColor)
      .strokeRect(x, y, this.width, this.height)
      .strokeRect(x, y, this.width, btnSize)
      .strokeLine(x, y + btnSize / 2, x + btnSize, y + btnSize / 2)
      .strokeRect(x, y, btnSize, btnSize)
  }
  renderClose (app, deltaPoint) {
    let x = this.x + deltaPoint.x
    let y = this.y + deltaPoint.y
    let btnSize = defaults.btnSize
    app.layer
      .fillStyle(this.expendBtnColor)
      .fillRect(x, y, btnSize, btnSize)
      .lineWidth(defaults.strokeWidth)
      .strokeStyle(this.strokeColor)
      .strokeLine(x + btnSize / 2, y, x + btnSize / 2, y + btnSize)
      .strokeLine(x, y + btnSize / 2, x + btnSize, y + btnSize / 2)
      .strokeRect(x, y, btnSize, btnSize)
  }
}

module.exports = Window
