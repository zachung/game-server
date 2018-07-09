import { Container, Graphics } from '../lib/PIXI'
import Vector from '../lib/Vector'

import keyboardJS from 'keyboardjs'
import { LEFT, UP, RIGHT, DOWN } from '../config/control'

const ALL_KEYS = [RIGHT, LEFT, UP, DOWN]

class TouchDirectionControlPanel extends Container {
  constructor ({ x, y, radius }) {
    super()
    this.position.set(x, y)

    let touchArea = new Graphics()
    touchArea.beginFill(0xF2F2F2, 0.5)
    touchArea.drawCircle(0, 0, radius)
    touchArea.endFill()
    this.addChild(touchArea)
    this.radius = radius

    this.setupTouch()
  }

  setupTouch () {
    this.interactive = true
    let f = this.onTouch.bind(this)
    this.on('touchstart', f)
    this.on('touchend', f)
    this.on('touchmove', f)
    this.on('touchendoutside', f)
  }

  onTouch (e) {
    let type = e.type
    let propagation = false
    switch (type) {
      case 'touchstart':
        this.drag = e.data.global.clone()
        this.createDragPoint()
        this.originPosition = {
          x: this.x,
          y: this.y
        }
        break
      case 'touchend':
      case 'touchendoutside':
        if (this.drag) {
          this.drag = false
          this.destroyDragPoint()
          this.releaseKeys()
        }
        break
      case 'touchmove':
        if (!this.drag) {
          propagation = true
          break
        }
        this.pressKeys(e.data.getLocalPosition(this))
        break
    }
    if (!propagation) {
      e.stopPropagation()
    }
  }

  createDragPoint () {
    let dragPoint = new Graphics()
    dragPoint.beginFill(0xF2F2F2, 0.5)
    dragPoint.drawCircle(0, 0, 20)
    dragPoint.endFill()
    this.addChild(dragPoint)
    this.dragPoint = dragPoint
  }

  destroyDragPoint () {
    this.removeChild(this.dragPoint)
    this.dragPoint.destroy()
  }

  pressKeys (newPoint) {
    this.releaseKeys()
    // 感應靈敏度
    let threshold = 30

    let vector = Vector.fromPoint(newPoint)
    let deg = vector.deg
    let len = vector.length

    if (len < threshold) {
      return
    }
    let degAbs = Math.abs(deg)
    let dx = degAbs < 67.5 ? RIGHT : (degAbs > 112.5 ? LEFT : false)
    let dy = degAbs < 22.5 || degAbs > 157.5 ? false : (deg < 0 ? UP : DOWN)

    if (dx || dy) {
      if (dx) {
        keyboardJS.pressKey(dx)
      }
      if (dy) {
        keyboardJS.pressKey(dy)
      }
      vector.multiplyScalar(this.radius / len)
      this.dragPoint.position.set(
        vector.x,
        vector.y
      )
    }
  }

  releaseKeys () {
    ALL_KEYS.forEach(key => keyboardJS.releaseKey(key))
  }

  toString () {
    return 'TouchDirectionControlPanel'
  }
}

export default TouchDirectionControlPanel
