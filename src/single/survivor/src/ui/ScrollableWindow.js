import { Container, Graphics } from '../lib/PIXI'

import Window from './Window'
import Wrapper from './Wrapper'

class ScrollableWindow extends Window {
  constructor (opt) {
    super(opt)
    let { width, height, padding = 5 } = opt

    const scrollBarWidth = 10
    this._initScrollableArea(
      width - padding * 2 - scrollBarWidth - 5,
      height - padding * 2,
      padding)
    this._initScrollBar({
      // window width - window padding - bar width
      x: width - padding - scrollBarWidth,
      y: padding,
      width: scrollBarWidth,
      height: height - padding * 2
    })
  }

  _initScrollableArea (width, height, padding) {
    // hold padding
    let _mainView = new Container()
    _mainView.position.set(padding, padding)
    this.addChild(_mainView)

    this.mainView = new Container()
    _mainView.addChild(this.mainView)

    // hide mainView's overflow
    let mask = new Graphics()
    mask.beginFill(0xFFFFFF)
    mask.drawRoundedRect(0, 0, width, height, 5)
    mask.endFill()
    this.mainView.mask = mask
    _mainView.addChild(mask)

    // window width - window padding * 2 - bar width - between space
    this._windowWidth = width
    this._windowHeight = height
  }

  _initScrollBar ({ x, y, width, height }) {
    let conatiner = new Container()
    conatiner.x = x
    conatiner.y = y

    let scrollBarBg = new Graphics()
    scrollBarBg.beginFill(0xA8A8A8)
    scrollBarBg.drawRoundedRect(0, 0, width, height, 2)
    scrollBarBg.endFill()

    let scrollBar = new Graphics()
    scrollBar.beginFill(0x222222)
    scrollBar.drawRoundedRect(0, 0, 10, height, 3)
    scrollBar.endFill()
    scrollBar.toString = () => 'scrollBar'
    Wrapper.draggable(scrollBar, {
      boundary: {
        x: 0,
        y: 0,
        width: width,
        height: height
      }
    })
    scrollBar.on('drag', this.scrollMainView.bind(this))

    conatiner.addChild(scrollBarBg)
    conatiner.addChild(scrollBar)
    this.addChild(conatiner)
    this.scrollBar = scrollBar
    this.scrollBarBg = scrollBarBg
  }

  scrollMainView () {
    // TODO: update scroll bar height
    let rate = this.scrollBar.y / (this.scrollBarBg.height - this.scrollBar.height)
    let y = (this.mainView.height - this.windowHeight) * rate
    this.mainView.y = -y
  }

  addWindowChild (child) {
    this.mainView.addChild(child)
  }

  updateScrollBarLength () {
    let dh = this.mainView.height / this.windowHeight
    if (dh < 1) {
      this.scrollBar.height = this.scrollBarBg.height
    } else {
      this.scrollBar.height = this.scrollBarBg.height / dh
      // 避免太小很難拖曳
      this.scrollBar.height = Math.max(20, this.scrollBar.height)
    }
    this.scrollBar.fallbackToBoundary()
    this.scrollMainView()
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
