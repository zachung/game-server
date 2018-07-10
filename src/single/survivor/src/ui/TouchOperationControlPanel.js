import { Container, Graphics } from '../lib/PIXI'

import keyboardJS from 'keyboardjs'
import { PLACE1 } from '../config/control'

class TouchOperationControlPanel extends Container {
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
  }

  onTouch (e) {
    let type = e.type
    let propagation = false
    switch (type) {
      case 'touchstart':
        this.drag = true
        break
      case 'touchend':
        if (this.drag) {
          this.drag = false
          keyboardJS.pressKey(PLACE1)
          keyboardJS.releaseKey(PLACE1)
        }
        break
    }
    if (!propagation) {
      e.stopPropagation()
    }
  }

  toString () {
    return 'TouchOperationControlPanel'
  }
}

export default TouchOperationControlPanel
