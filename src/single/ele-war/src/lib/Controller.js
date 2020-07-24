import hotkeys from 'hotkeys-js'

class Controller {
  constructor (item, options = {}) {
    this.item = item
    this.init(options)
  }

  init (options) {
    const { up = 'up', down = 'down', right = 'right', left = 'left' } = options
    hotkeys(left, () => this.left())
    hotkeys(up, () => this.up())
    hotkeys(right, () => this.right())
    hotkeys(down, () => this.down())
  }

  left () {
    this.move(-1, 0)
  }

  up () {
    this.move(0, -1)
  }

  right () {
    this.move(1, 0)
  }

  down () {
    this.move(0, 1)
  }

  move (dx, dy) {
    const item = this.item
    item.move(item.location.x + dx, item.location.y + dy)
  }
}

export default Controller