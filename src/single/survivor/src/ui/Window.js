import { Container, Graphics } from '../lib/PIXI'

import Wrapper from './Wrapper'

class Window extends Container {
  constructor (opt) {
    super(opt)
    let { x, y, width, height } = opt

    this.position.set(x, y)

    let windowBg = new Graphics()
    windowBg.beginFill(0xF2F2F2)
    windowBg.lineStyle(3, 0x222222, 1)
    windowBg.drawRoundedRect(0, 0, width, height, 5)
    windowBg.endFill()
    this.addChild(windowBg)

    Wrapper.draggable(this, opt)
  }

  toString () {
    return 'window'
  }
}

export default Window
