import { Container, Graphics } from '../lib/PIXI'
import Vector from '../lib/Vector'

import globalEventManager from '../lib/globalEventManager'

class TouchOperationControlPanel extends Container {
  constructor ({ x, y, width, height }) {
    super()
    this.position.set(x, y)

    let touchArea = new Graphics()
    touchArea.beginFill(0xF2F2F2, 0.5)
    touchArea.drawRect(0, 0, width, height)
    touchArea.endFill()
    this.addChild(touchArea)

    this.setupTouch()
  }

  setupTouch () {
    this.center = new Vector(this.width / 2, this.height / 2)
    this.interactive = true
    let f = this.onTouch.bind(this)
    this.on('touchstart', f)
  }

  onTouch (e) {
    let pointer = e.data.getLocalPosition(this)
    let vector = Vector.fromPoint(pointer).sub(this.center)
    globalEventManager.emit('rotate', vector)
    globalEventManager.emit('fire')
    e.stopPropagation()
  }

  toString () {
    return 'TouchOperationControlPanel'
  }
}

export default TouchOperationControlPanel
