import { Container, Graphics } from '../lib/PIXI'

import Window from './Window'
import Draggable from './Draggable'

class ScrollableWindow extends Window {
  constructor (opt) {
    super(opt)
    let { width, height, padding } = opt

    this.padding = padding || 5

    let _mainView = new Container()
    _mainView.position.set(this.padding, this.padding)
    this.mainView = new Container()
    _mainView.addChild(this.mainView)
    this.addChild(_mainView)

    const scrollBarWidth = 10

    this._initScrollBar({
      x: width - scrollBarWidth - this.padding,
      y: this.padding,
      width: scrollBarWidth,
      height: height - this.padding * 2
    })

    this._windowWidth = width - scrollBarWidth - this.padding * 2
    this._windowHeight = height - this.padding * 2
  }

  _initScrollBar ({ x, y, width, height }) {
    let conatiner = new Container()
    conatiner.x = x
    conatiner.y = y

    let scrollBarBg = new Graphics()
    scrollBarBg.beginFill(0xA8A8A8)
    scrollBarBg.drawRoundedRect(0, 0, width, height, 2)
    scrollBarBg.endFill()

    let scrollBar = new Draggable({
      boundary: {
        x: 0,
        y: 0,
        width: width,
        height: height
      }
    })
    scrollBar.beginFill(0x222222)
    scrollBar.drawRoundedRect(0, 0, 10, 50, 3)
    scrollBar.endFill()
    scrollBar.toString = () => 'scrollBar'
    scrollBar.on('drag', this.scrollMainView.bind(this))

    conatiner.addChild(scrollBarBg)
    conatiner.addChild(scrollBar)
    this.addChild(conatiner)
    this.scrollBar = scrollBar
    this.scrollBarBg = scrollBarBg
  }

  scrollMainView () {
    // TODO: hide mainView's overflow
    // TODO: update scroll bar height
    let rate = this.scrollBar.y / (this.scrollBarBg.height - this.scrollBar.height)
    let y = (this.mainView.height - this.windowHeight) * rate
    this.mainView.y = -y
  }

  addWindowChild (...args) {
    this.mainView.addChild(...args)
  }

  get windowWidth () {
    return this._windowWidth
  }

  get windowHeight () {
    return this._windowHeight
  }

  toString () {
    return 'window'
  }
}

export default ScrollableWindow
