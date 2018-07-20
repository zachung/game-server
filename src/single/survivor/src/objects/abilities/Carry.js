import Ability from './Ability'
import { ABILITY_CARRY, ABILITY_LEARN } from '../../config/constants'

function newSlot (skill, count) {
  return {
    skill,
    count,
    toString () {
      return [skill.toString(), '(', this.count, ')'].join('')
    }
  }
}

class Carry extends Ability {
  constructor (initSlots) {
    super()
    this.current = 0
    this.bags = Array(initSlots).fill()
  }

  get type () { return ABILITY_CARRY }

  carryBy (owner) {
    super.carryBy(owner)
    this.owner = owner
    owner[ABILITY_CARRY] = this
  }

  // 暫時沒有限制施放次數
  take (skill, count) {
    let owner = this.owner
    if (skill instanceof Ability && owner[ABILITY_LEARN]) {
      // 取得能力
      owner[ABILITY_LEARN].learn(skill)
      return
    }
    count = count === -1 ? Infinity : count
    let key = skill.toString()
    let firstEmptySlot
    let found = this.bags.some((slot, si) => {
      // 暫存第一個空格
      if (slot === undefined && firstEmptySlot === undefined) {
        firstEmptySlot = si
      }
      // 技能升級(同類型)
      if (slot && slot.skill.toString() === key &&
        skill.level > slot.skill.level) {
        this.bags[si] = newSlot(skill, count)
        return true
      }
      return false
    })
    if (!found) {
      if (firstEmptySlot === undefined) {
        // 沒有空格可放物品
        owner.say('no empty slot for new skill got.')
        return
      }
      // 放入第一個空格
      this.bags[firstEmptySlot] = newSlot(skill, count)
    }
    owner.emit('inventory-modified', skill)
  }

  getSlotItem (slotInx) {
    let si
    // 照著包包加入順序查找
    let found = this.bags.find((slot, s) => {
      si = s
      return slotInx-- === 0
    })
    let skill
    if (found) {
      found = this.bags[si]
      skill = found.skill
      // 取出後減一
      if (--found.count === 0) {
        this.bags[si] = undefined
      }
      this.owner.emit('inventory-modified', skill)
    }
    return skill
  }

  getCurrent () {
    let found = this.bags[this.current]
    let skill
    if (found) {
      skill = found.skill
      // 取出後減一
      if (--found.count === 0) {
        this.bags[this.current] = undefined
      }
      this.owner.emit('inventory-modified', skill)
    }
    return skill
  }

  setCurrent (current) {
    this.current = current
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
