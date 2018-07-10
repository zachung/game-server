import Ability from './Ability'
import { ABILITY_CARRY, ABILITY_LEARN } from '../../config/constants'

function newSlot (item, count) {
  return {
    item,
    count,
    toString () {
      return [item.toString(), '(', this.count, ')'].join('')
    }
  }
}

class Carry extends Ability {
  constructor (initSlots) {
    super()
    this.bags = []
    this.bags.push(Array(initSlots).fill())
  }

  get type () { return ABILITY_CARRY }

  carryBy (owner) {
    super.carryBy(owner)
    this.owner = owner
    owner[ABILITY_CARRY] = this
  }

  take (item, count = 1) {
    let owner = this.owner
    if (item instanceof Ability && owner[ABILITY_LEARN]) {
      // 取得能力
      owner[ABILITY_LEARN].learn(item)
      return
    }
    let key = item.toString()
    let firstEmptySlot
    let found = this.bags.some((bag, bi) => {
      return bag.some((slot, si) => {
        // 第一個空格
        if (!slot && !firstEmptySlot) {
          firstEmptySlot = {si, bi}
        }
        // 物品疊加(同類型)
        if (slot && slot.item.toString() === key) {
          slot.count += count
          return true
        }
        return false
      })
    })
    if (!found) {
      if (!firstEmptySlot) {
        // 沒有空格可放物品
        owner.say('no empty slot for new item got.')
        return
      }
      this.bags[firstEmptySlot.bi][firstEmptySlot.si] = newSlot(item, count)
    }
    owner.emit('inventory-modified', item)
  }

  getSlotItem (slotInx) {
    let bi
    let si
    // 照著包包加入順序查找
    let found = this.bags.find((bag, b) => {
      bi = b
      return bag.find((slot, s) => {
        si = s
        return slotInx-- === 0
      })
    })
    let item
    if (found) {
      found = this.bags[bi][si]
      item = found.item
      // 取出後減一
      if (--found.count === 0) {
        this.bags[bi][si] = undefined
      }
      this.owner.emit('inventory-modified', item)
    }
    return item
  }

  toString () {
    return ['carry: ', this.bags.join(', ')].join('')
  }

  // TODO: save data
  serialize () {
    return this.bags
  }
}

export default Carry
