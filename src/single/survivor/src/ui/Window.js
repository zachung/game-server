import Draggable from './Draggable'

class Window extends Draggable {
  constructor (opt) {
    super(opt)
    let { x, y, width, height } = opt

    this.beginFill(0xF2F2F2)
    this.lineStyle(3, 0x222222, 1)
    this.drawRoundedRect(x, y, width, height, 5)
    this.endFill()
  }

  toString () {
    return 'window'
  }
}

export default Window
