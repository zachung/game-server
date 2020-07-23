const Window = require('./Window')

class Tech {
  constructor () {
    this.data = {
      level: 0,
      isEnabled: false
    }
    this.parent = null
    this.children = []
  }
  upgrade () {
    this.data.level++
  }
  upgradeCost () {
    return this.data.level * 30
  }
}

class Tree {
  constructor (tech) {
    this._root = tech
  }
}

class TechTree extends Window {
  constructor (options) {
    const defaults = {
      width: 500,
      height: 1000,
      backgroundColor: '#066'
    }
    const populated = Object.assign(defaults, options)
    super(populated)
    this.init()
  }
  init () {
    // this.tree = new Tech();
    // this.tree._root.children.push(new Tech());
  }
  renderExpend (app) {
    super.renderExpend.apply(this, arguments)

    let renderArea = this.renderArea
    let iconSize = 50
    app.layer
      .fillStyle('#777')
      .fillRect(renderArea.x, renderArea.y, iconSize, iconSize)
      .lineWidth(5)
      .strokeStyle('#FFF')
      .strokeRect(renderArea.x, renderArea.y, iconSize, iconSize)
  }
}

module.exports = TechTree
