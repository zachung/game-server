import Window from './Window'
import { Container, Graphics, Text, TextStyle } from '../lib/PIXI'
import { ABILITY_CARRY } from '../config/constants'

class Slot extends Container {
  constructor ({ x, y, width, height }) {
    super()
    this.position.set(x, y)

    let rect = new Graphics()
    rect.beginFill(0xA2A2A2)
    rect.drawRoundedRect(0, 0, width, height, 5)
    rect.endFill()
    this.addChild(rect)
  }

  setContext (item, count) {
    this.clearContext()

    let width = this.width
    let height = this.height
    // 置中
    item = new item.constructor()
    let maxSide = Math.max(item.width, item.height)
    let scale = width / maxSide
    item.scaleEx.set(scale)
    item.anchor.set(0.5, 0.5)
    item.position.set(width / 2, height / 2)
    this.addChild(item)

    // 數量
    let fontSize = this.width * 0.3
    let style = new TextStyle({
      fontSize: fontSize,
      fill: 'red',
      fontWeight: '600',
      lineHeight: fontSize
    })
    let countText = count === Infinity ? '∞' : count
    let text = new Text(countText, style)
    text.position.set(width * 0.95, height)
    text.anchor.set(1, 1)
    this.addChild(text)

    this.item = item
    this.text = text
  }

  clearContext () {
    if (this.item) {
      this.item.destroy()
      this.text.destroy()
      delete this.item
      delete this.text
    }
  }
}

class InventoryWindow extends Window {
  constructor (opt) {
    let { player, width } = opt
    let padding = width * 0.1
    let ceilSize = width - padding * 2
    let ceilOpt = {
      x: padding,
      y: padding,
      width: ceilSize,
      height: ceilSize
    }
    let slotCount = 4
    opt.height = (width - padding) * slotCount + padding

    super(opt)

    this._opt = opt
    player.on('inventory-modified', this.onInventoryModified.bind(this, player))

    this.slotContainers = []
    this.slots = []
    for (var i = 0; i < slotCount; i++) {
      let slot = new Slot(ceilOpt)
      this.addChild(slot)
      this.slotContainers.push(slot)
      ceilOpt.y += ceilSize + padding
    }

    this.onInventoryModified(player)
  }

  onInventoryModified (player) {
    let carryAbility = player[ABILITY_CARRY]
    if (!carryAbility) {
      // no inventory yet
      return
    }
    let i = 0
    carryAbility.bags.forEach(bag => bag.forEach(slot => {
      this.slots[i] = slot
      i++
    }))
    this.slotContainers.forEach((container, i) => {
      let slot = this.slots[i]
      if (slot) {
        container.setContext(slot.item, slot.count)
      } else {
        container.clearContext()
      }
    })
  }

  toString () {
    return 'window'
  }
}

export default InventoryWindow
