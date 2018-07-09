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
    owner[ABILITY_CARRY] = this[ABILITY_CARRY].bind(this, owner)
  }

  [ABILITY_CARRY] (owner, item, count = 1) {
    if (item instanceof Ability && owner[ABILITY_LEARN]) {
      // 取得能力
      owner[ABILITY_LEARN](item)
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
  }

  toString () {
    return ['carry: ', this.bags.join(', ')].join('')
  }
}

export default Carry
