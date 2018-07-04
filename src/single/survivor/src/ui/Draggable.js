import { Graphics } from '../lib/PIXI'

class Draggable extends Graphics {
  constructor ({ boundary }) {
    super()
    this.boundary = boundary
    this._enableDraggable()
  }

  _enableDraggable () {
    this.drag = false
    this.interactive = true
    let f = this._onTouch.bind(this)
    this.on('touchstart', f)
    this.on('touchend', f)
    this.on('touchmove', f)
    this.on('touchendoutside', f)
    this.on('mousedown', f)
    this.on('mouseup', f)
    this.on('mousemove', f)
    this.on('mouseupoutside', f)
  }

  _onTouch (e) {
    let type = e.type
    let propagation = false
    switch (type) {
      case 'touchstart':
      case 'mousedown':
        this.drag = e.data.global.clone()
        this.originPosition = {
          x: this.x,
          y: this.y
        }
        break
      case 'touchend':
      case 'touchendoutside':
      case 'mouseup':
      case 'mouseupoutside':
        this.drag = false
        break
      case 'touchmove':
      case 'mousemove':
        if (!this.drag) {
          propagation = true
          break
        }
        let newPoint = e.data.global.clone()
        this.position.set(
          this.originPosition.x + newPoint.x - this.drag.x,
          this.originPosition.y + newPoint.y - this.drag.y
        )
        this._fallbackToBoundary()
        this.emit('drag') // maybe can pass param for some reason: e.data.getLocalPosition(this)
        break
    }
    if (!propagation) {
      e.stopPropagation()
    }
  }

  // 退回邊界
  _fallbackToBoundary (child) {
    this.x = Math.max(this.x, this.boundary.x)
    this.x = Math.min(this.x, this.boundary.x + this.boundary.width - this.width)
    this.y = Math.max(this.y, this.boundary.y)
    this.y = Math.min(this.y, this.boundary.y + this.boundary.height - this.height)
  }

  toString () {
    return 'Draggable'
  }
}

export default Draggable
