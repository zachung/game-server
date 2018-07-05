import { Container, Graphics } from '../lib/PIXI'

import messages from '../lib/Messages'
import keyboardJS from 'keyboardjs'
import { LEFT, UP, RIGHT, DOWN } from '../config/control'

class TouchControlPanel extends Container {
  constructor ({ x, y, radius }) {
    super()
    this.position.set(x, y)

    let touchArea = new Graphics()
    touchArea.beginFill(0xF2F2F2, 0.5)
    touchArea.drawCircle(0, 0, radius)
    touchArea.endFill()
    this.addChild(touchArea)

    this.setupTouch()
  }

  setupTouch () {
    this.interactive = true
    let f = this.onTouch.bind(this)
    this.on('touchstart', f)
    this.on('touchend', f)
    this.on('touchmove', f)
    this.on('touchendoutside', f)
    this.on('mousedown', f)
    this.on('mouseup', f)
    this.on('mousemove', f)
    this.on('mouseupoutside', f)
  }

  onTouch (e) {
    let type = e.type
    let propagation = false
    messages.add(type)
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
        let x = newPoint.x - this.drag.x
        let y = newPoint.y - this.drag.y
        let dx = 0
        let dy = 0
        let thred = 10
        keyboardJS.releaseKey(RIGHT)
        keyboardJS.releaseKey(LEFT)
        keyboardJS.releaseKey(UP)
        keyboardJS.releaseKey(DOWN)
        messages.add(['(', x.toFixed(2), ', ', y.toFixed(2), ')'].join(''))
        if (x > thred) {
          dx = 1
          keyboardJS.pressKey(RIGHT)
        } else if (x < -thred) {
          dx = -1
          keyboardJS.pressKey(LEFT)
        }
        if (y > thred) {
          dy = 1
          keyboardJS.pressKey(DOWN)
        } else if (y < -thred) {
          dy = -1
          keyboardJS.pressKey(UP)
        }
        messages.add([dx, dy].join(', '))
        break
    }
    if (!propagation) {
      e.stopPropagation()
    }
  }

  toString () {
    return 'TouchControlPanel'
  }
}

export default TouchControlPanel
