const Ball = require('./ball')
const Floor = require('./floor')
const Cell = require('./cell')
const Block = require('./block')
const Wall = require('./wall')
const Bomb = require('./bomb')

class GameMap extends Ball {
  constructor (options) {
    const defaults = {
      x: 0,
      y: 0,
      w: 13,
      h: 13,
      size: 64,
      cells: [],
      objects: {}
    }
    const populated = Object.assign(defaults, options)
    super(populated)
    this.width = this.w * this.size
    this.height = this.h * this.size
    this.objects = {}
    if (this.cells.length !== 0) {
      for (var i = 0; i < this.w; i++) {
        for (var j = 0; j < this.h; j++) {
          var cell = new Cell(this.cells[i][j])
          this.cells[i][j] = cell
          for (const object of cell.standInObjects) {
            this._setLocation(object, i, j)
          }
        }
      }
    }
  }
  init () {
    for (var i = 0; i < this.w; i++) {
      this.cells[i] = []
      for (var j = 0; j < this.h; j++) {
        var options = {
          x: this.x + i * this.size,
          y: this.y + j * this.size,
          i: i,
          j: j
        }
        var cell = new Cell(options, this)
        this.cells[i][j] = cell
        this.setLocation(new Floor(options), i, j)
        // wall
        if (i % 2 !== 1 && j % 2 !== 1 ||
          i === 0 ||
          j === 0 ||
          i === this.w - 1 ||
          j === this.h - 1) {
          this.setLocation(new Wall(options), i, j)
        } else if (i > 0 &&
          i < this.w - 1 &&
          j > 2 &&
          j < this.h - 3 &&
          (i % 2 === 1 || j % 2 === 1)) {
          // block
          options.type = Math.floor(Math.random() * 4)
          this.setLocation(new Block(options), i, j)
        } else if (i > 2 &&
          i < this.w - 3 &&
          j > 0 &&
          j < this.h - 1) {
          // block
          options.type = Math.floor(Math.random() * 4)
          this.setLocation(new Block(options), i, j)
        }
      }
    }
    // set user location
    this.userLocation = [
      {i: 1, j: 1, hasUser: false},
      {i: 1, j: 11, hasUser: false},
      {i: 11, j: 1, hasUser: false},
      {i: 11, j: 11, hasUser: false}
    ]
  }
  * step (dt) {
    super.step(dt)
    for (var i = 0; i < this.w; i++) {
      for (var j = 0; j < this.h; j++) {
        this.cells[i][j].step(dt, this)
      }
    }
  }
  render (app, deltaPoint = { x: 0, y: 0 }, id) {
    var hpX = 1000
    var hpDy = 20
    var hpH = 30
    var hpHInit = 20
    var hpHCurrent = hpHInit + hpH + hpDy

    for (const clazz of ['Floor', 'Thomas', 'Wall', 'Block', 'Bomb', 'Item', 'Fire']) {
      if (this.objects[clazz]) {
        for (const object of this.objects[clazz]) {
          object.render(app, deltaPoint)
          // render user hp bar
          if (clazz === 'Thomas') {
            let hpY = hpHCurrent
            if (object.id !== id) {
              hpHCurrent += hpH + hpDy
              hpY = hpHCurrent
            } else {
              hpY = hpHInit
            }
            app.layer
              .fillStyle('#000')
              .fillRect(hpX, hpY, 200, hpH)
              .fillStyle('#F00')
              .fillRect(hpX, hpY, 200 * (object.hp / object.hpMax), hpH)
          }
        }
      }
    }
  }
  _setLocation (object, i, j) {
    var gameMap = this
    // first set location, for render
    if (!this.objects[object.class]) {
      this.objects[object.class] = []
    }
    this.objects[object.class].push(object)
    object.on('die', function () {
      object.dieOnMapPre(gameMap)
      // when object die, remove from map
      gameMap.remove(object)
      object.dieOnMapAfter(gameMap)
    })
  }
  addUser (user) {
    var userLocation = this.userLocation
    var loc = userLocation.filter(loc => !loc.hasUser)[0]
    userLocation[userLocation.indexOf(loc)].hasUser = true
    this.setLocation(user, loc.i, loc.j)
    user.on('die', function () {
      userLocation[userLocation.indexOf(loc)].hasUser = false
    })
  }
  setLocation (object, i, j) {
    if (object.inMapLocation) {
      this.moveObject(object, 0, 0)
    } else {
      if (!this.standIn(object, i, j)) {
        // can't get in this place
        return false
      } else {
        this._setLocation(object, i, j)
      }
    }
    var cell = this.cells[object.inMapLocation.i][object.inMapLocation.j]
    object.x = cell.x
    object.y = cell.y
    return cell.canGetIn()
  }
  isCellExist (i, j) {
    if (!this.cells[i] || !this.cells[i][j]) {
      return false
    }
    return true
  }
  canGetIn (i, j) {
    if (!this.isCellExist(i, j)) {
      return false
    }
    return this.cells[i][j].canGetIn()
  }
  standIn (object, i, j) {
    if (!this.isCellExist(i, j)) {
      return false
    }
    if (object.class === 'Fire') {
      if (!this.cells[i][j].canFire()) {
        return false
      }
    } else if (!this.cells[i][j].canGetIn()) {
      return false
    }
    this.cells[i][j].in(object)
    return true
  }
  moveObject (object, dx, dy) {
    var i = object.inMapLocation.i
    var j = object.inMapLocation.j
    if (!this.standIn(object, i + dx, j + dy)) {
      return false
    }
    this.cells[i][j].out(object)
    return true
  }
  // remove object
  remove (object) {
    this.cells[object.inMapLocation.i][object.inMapLocation.j].out(object)
    var index = this.objects[object.class].indexOf(object)
    if (index !== -1) {
      this.objects[object.class].splice(index, 1)
    }
  }
  spawnBomb (object) {
    var i = object.inMapLocation.i
    var j = object.inMapLocation.j
    var cell = this.cells[i][j]
    var bomb = new Bomb({
      x: cell.x,
      y: cell.y,
      radius: object.fireRadius,
      damage: 10,
      countdown: 2
    })
    this.setLocation(bomb, cell.i, cell.j)
    return bomb
  }
  getUser (id) {
    if (!this.objects['Thomas']) {
      return null
    }
    let users = this.objects['Thomas'].filter(user => user.id === id)
    if (users.length > 0) {
      return users[0]
    }
    return null
  }
}

module.exports = GameMap
