import { Container, Graphics } from '../lib/PIXI'

import Window from './Window'
import Wrapper from './Wrapper'

class ScrollableWindow extends Window {
  constructor (opt) {
    super(opt)
    let {
      width,
      height,
      padding = 8,
      scrollBarWidth = 10
    } = opt
    this._opt = opt

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
    scrollBar.drawRoundedRect(0, 0, width, height, 3)
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

  // 捲動視窗
  scrollMainView () {
    this.mainView.y = (this.windowHeight - this.mainView.height) * this.scrollPercent
  }

  // 新增物件至視窗
  addWindowChild (child) {
    this.mainView.addChild(child)
  }

  // 更新捲動棒大小, 不一定要調用
  updateScrollBarLength () {
    let { scrollBarMinHeight = 20 } = this._opt

    let dh = this.mainView.height / this.windowHeight
    if (dh < 1) {
      this.scrollBar.height = this.scrollBarBg.height
    } else {
      this.scrollBar.height = this.scrollBarBg.height / dh
      // 避免太小很難拖曳
      this.scrollBar.height = Math.max(scrollBarMinHeight, this.scrollBar.height)
    }
    this.scrollBar.fallbackToBoundary()
  }

  // 捲動百分比
  get scrollPercent () {
    let delta = this.scrollBarBg.height - this.scrollBar.height
    return delta === 0 ? 1 : this.scrollBar.y / delta
  }

  // 捲動至百分比
  scrollTo (percent) {
    let delta = this.scrollBarBg.height - this.scrollBar.height
    let y = 0
    if (delta !== 0) {
      y = delta * percent
    }
    this.scrollBar.y = y
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
