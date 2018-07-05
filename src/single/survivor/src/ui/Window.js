import { Container, Graphics } from '../lib/PIXI'

class Window extends Container {
  constructor ({ x, y, width, height }) {
    super()
    this.position.set(x, y)

    let lineWidth = 3

    let windowBg = new Graphics()
    windowBg.beginFill(0xF2F2F2)
    windowBg.lineStyle(lineWidth, 0x222222, 1)
    windowBg.drawRoundedRect(
      0, 0,
      width - lineWidth,
      height - lineWidth,
      5)
    windowBg.endFill()
    this.addChild(windowBg)
  }

  toString () {
    return 'window'
  }
}

export default Window
