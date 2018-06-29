import { resources, Sprite } from '../lib/PIXI'
import keyboard from '../keyboard'
import { MOVE } from '../config/constants'

function _getSlotParts (slots, type) {
  return slots.filter(slot => slot.type === type)
}
function _getSlotPart (slots, type) {
  return slots.find(slot => slot.type === type)
}

class Cat extends Sprite {
  constructor () {
    // Create the cat sprite
    super(resources['images/town_tiles.json'].textures['wall.png'])

    // Change the sprite's position
    this.dx = 0
    this.dy = 0

    this.init()
    this.slots = []
  }

  addSlotPart (slot) {
    switch (slot.type) {
      case MOVE:
        let moveSlot = _getSlotPart(this.slots, MOVE)
        if (moveSlot) {
          if (moveSlot.value > slot.value) {
            return
          }
          let inx = this.slots.indexOf(moveSlot)
          this.slots[inx] = slot
        } else {
          this.slots.push(slot)
        }
        return
    }
    this.slots.push(slot)
  }

  move (delta) {
    let moveSlot = _getSlotPart(this.slots, MOVE)
    if (!moveSlot) {
      return
    }

    this.x += this.dx * moveSlot.value * delta
    this.y += this.dy * moveSlot.value * delta
  }

  take (inventories) {
    inventories.forEach(slot => this.addSlotPart(slot))
  }

  operate (other) {
    other.operate(this)
  }

  init () {
    // Capture the keyboard arrow keys
    let left = keyboard(65)
    let up = keyboard(87)
    let right = keyboard(68)
    let down = keyboard(83)

    // Left
    left.press = () => {
      this.dx = -1
      this.dy = 0
    }
    left.release = () => {
      if (!right.isDown && this.dy === 0) {
        this.dx = 0
      }
    }

    // Up
    up.press = () => {
      this.dy = -1
      this.dx = 0
    }
    up.release = () => {
      if (!down.isDown && this.dx === 0) {
        this.dy = 0
      }
    }

    // Right
    right.press = () => {
      this.dx = 1
      this.dy = 0
    }
    right.release = () => {
      if (!left.isDown && this.dy === 0) {
        this.dx = 0
      }
    }

    // Down
    down.press = () => {
      this.dy = 1
      this.dx = 0
    }
    down.release = () => {
      if (!up.isDown && this.dx === 0) {
        this.dy = 0
      }
    }
  }

  tick (delta) {
    this.move(delta)
  }
}

export default Cat
