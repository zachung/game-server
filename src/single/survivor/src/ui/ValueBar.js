import { Container, Graphics } from '../lib/PIXI'

class ValueBar extends Container {
  constructor (opt) {
    super()
    let { x = 0, y = 0, width, height, color } = opt

    // background
    let hpBarBg = new Graphics()
    hpBarBg.beginFill(0xA2A2A2)
    hpBarBg.lineStyle(1, 0x222222, 1)
    hpBarBg.drawRect(0, 0, width, height)
    hpBarBg.endFill()

    // mask
    let mask = new Graphics()
    mask.beginFill(0xFFFFFF)
    mask.drawRect(0, 0, width, height)
    mask.endFill()
    this.addChild(mask)
    this.barMask = mask

    this.addChild(hpBarBg)
    this.hpBarBg = hpBarBg

    // bar
    this._renderBar({color, width, height})
    this.position.set(x, y)
    this._opt = opt

    this.on('value-change', this.update.bind(this))
  }

  update (rate) {
    this.removeChild(this.hpBarInner)
    this.hpBarInner.destroy()
    let { color, width, height } = this._opt
    this._renderBar({
      color,
      width: width * rate,
      height
    })
  }

  _renderBar ({color, width, height}) {
    let hpBarInner = new Graphics()
    hpBarInner.beginFill(color)
    hpBarInner.drawRect(0, 0, width, height)
    hpBarInner.endFill()
    hpBarInner.mask = this.barMask

    this.addChild(hpBarInner)
    this.hpBarInner = hpBarInner
  }
}

export default ValueBar
