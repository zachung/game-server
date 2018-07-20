import Window from './Window'
import { Container, Graphics, Text, TextStyle } from '../lib/PIXI'
import { ABILITY_CARRY } from '../config/constants'
import keyboardJS from 'keyboardjs'
import { SWITCH1, SWITCH2, SWITCH3, SWITCH4 } from '../config/control'

const SLOTS = [ SWITCH1, SWITCH2, SWITCH3, SWITCH4 ]

class Slot extends Container {
  constructor ({ x, y, width, height }) {
    super()
    this.position.set(x, y)

    let rect = new Graphics()
    rect.beginFill(0xA2A2A2)
    rect.drawRoundedRect(0, 0, width, height, 5)
    rect.endFill()
    this.addChild(rect)

    let borderRect = new Graphics()
    borderRect.lineStyle(3, 0xFF0000, 1)
    borderRect.drawRect(0, 0, width, height)
    borderRect.endFill()
    borderRect.visible = false
    this.addChild(borderRect)

    this.borderRect = borderRect
  }

  setContext (skill, count) {
    this.clearContext()

    let width = this.width
    let height = this.height
    // 置中
    let sprite = skill.sprite()
    let maxSide = Math.max(sprite.width, sprite.height)
    let scale = width / maxSide
    sprite.scale.set(scale)
    sprite.position.set(width / 2 - sprite.width / 2, height / 2 - sprite.height / 2)
    this.addChild(sprite)

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

    this.sprite = sprite
    this.text = text
  }

  clearContext () {
    if (this.sprite) {
      this.sprite.destroy()
      this.text.destroy()
      delete this.sprite
      delete this.text
    }
  }

  select () {
    this.borderRect.visible = true
  }

  deselect () {
    this.borderRect.visible = false
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
    for (var i = 0; i < slotCount; i++) {
      let slot = new Slot(ceilOpt)
      let key = SLOTS[i]
      let press = () => {
        keyboardJS.pressKey(key)
        keyboardJS.releaseKey(key)
      }
      slot.interactive = true
      // tap for switch skill
      slot.on('click', press)
      slot.on('tap', press)
      this.addChild(slot)
      this.slotContainers.push(slot)
      ceilOpt.y += ceilSize + padding
    }
    // default use first one
    this.slotContainers[0].select()

    this.onInventoryModified(player)
    this.setup(player)
  }

  onInventoryModified (player) {
    let carryAbility = player[ABILITY_CARRY]
    if (!carryAbility) {
      // no inventory yet
      return
    }
    let slots = []
    let i = 0
    carryAbility.bags.forEach(slot => {
      slots[i] = slot
      i++
    })
    this.slotContainers.forEach((container, i) => {
      let slot = slots[i]
      if (slot) {
        container.setContext(slot.skill, slot.count)
      } else {
        container.clearContext()
      }
    })
  }

  setup (player) {
    let carryAbility = player[ABILITY_CARRY]
    let bind = key => {
      let slotInx = SLOTS.indexOf(key)
      let handler = e => {
        e.preventRepeat()
        carryAbility.setCurrent(slotInx)
        this.slotContainers.forEach((container, i) => {
          if (i === slotInx) {
            container.select()
          } else {
            container.deselect()
          }
        })
      }
      keyboardJS.bind(key, handler, () => {})
      return handler
    }

    let binds
    keyboardJS.setContext('')
    keyboardJS.withContext('', () => {
      binds = {
        SWITCH1: bind(SWITCH1),
        SWITCH2: bind(SWITCH2),
        SWITCH3: bind(SWITCH3),
        SWITCH4: bind(SWITCH4)
      }
    })

    player.once('removed', () => {
      Object.entries(binds).forEach(([key, handler]) => {
        keyboardJS.unbind(key, handler)
      })
    })
  }

  toString () {
    return 'window'
  }
}

export default InventoryWindow
