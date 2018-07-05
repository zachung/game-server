const OPT = Symbol('opt')

function _enableDraggable () {
  this.drag = false
  this.interactive = true
  let f = _onTouch.bind(this)
  this.on('touchstart', f)
  this.on('touchend', f)
  this.on('touchmove', f)
  this.on('touchendoutside', f)
  this.on('mousedown', f)
  this.on('mouseup', f)
  this.on('mousemove', f)
  this.on('mouseupoutside', f)
}

function _onTouch (e) {
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
      _fallbackToBoundary.call(this)
      this.emit('drag') // maybe can pass param for some reason: e.data.getLocalPosition(this)
      break
  }
  if (!propagation) {
    e.stopPropagation()
  }
}

// 退回邊界
function _fallbackToBoundary () {
  let { width = this.width, height = this.height, boundary } = this[OPT]
  this.x = Math.max(this.x, boundary.x)
  this.x = Math.min(this.x, boundary.x + boundary.width - width)
  this.y = Math.max(this.y, boundary.y)
  this.y = Math.min(this.y, boundary.y + boundary.height - height)
}
class Wrapper {
  /**
   * displayObject: will wrapped DisplayObject
   * opt: {
   *  boundary: 拖曳邊界 { x, y, width, height }
   *  [, width]: 邊界碰撞寬(default: displayObject.width)
   *  [, height]: 邊界碰撞高(default: displayObject.height)
   *  }
   */
  static draggable (displayObject, opt) {
    displayObject[OPT] = opt
    _enableDraggable.call(displayObject)
    displayObject.fallbackToBoundary = _fallbackToBoundary
  }
}

export default Wrapper
