const Ball = require('./ball')
const Wall = require('./wall')
const Fire = require('./fire')
const Thomas = require('./thomas')
const Guid = require('../../../../library/Guid')
const Vector = require('../../../../library/Vector')
const Clazzes = {
  'Thomas': Thomas,
  'Fire': Fire,
  'Wall': Wall
}

class GameMap extends Ball {
  constructor (options) {
    const defaults = {
      x: 0,
      y: 0,
      objects: {
        'Floor': {},
        'Wall': {},
        'Block': {},
        'Item': {},
        'Thomas': {},
        'Bomb': {},
        'Fire': {}
      }
    }
    const populated = Object.assign(defaults, options)
    super(populated)
    for (let [clazz, objects] of Object.entries(this.objects)) {
      for (let [id, object] of Object.entries(objects)) {
        this.objects[clazz][id] = new Clazzes[object.class](object)
        this.addObject(this.objects[clazz][id])
      }
    }
  }
  init () {
    let area_size = 800
    let angle = 0
    while (angle <= 360) {
      let radians = angle * Math.PI / 180
      let x = Math.cos(radians) * area_size
      let y = Math.sin(radians) * area_size
      let wall = new Wall({
        id: Guid.gen('wall'),
        x: x,
        y: y
      })
      wall.on('step', () => {
        this.attackOnTouch(wall, wall)
      })
      this.addObject(wall)
      angle += 12
    }
  }
  step (dt) {
    super.step(dt)
    Object.values(this.objects).forEach(clazzes => {
      Object.values(clazzes).forEach(object => object.step(dt))
    })
  }
  render (app, deltaPoint = { x: 0, y: 0 }, id) {
    var hpX = app.width - 250
    var hpDy = 20
    var hpH = 30
    var hpHInit = 20
    var hpHCurrent = hpHInit + hpH + hpDy

    for (const clazzes of Object.values(this.objects)) {
      for (const object of Object.values(clazzes)) {
        object.render(app, deltaPoint)
        // render user hp bar
        if (object.class === 'Thomas') {
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
  addUser (user) {
    user.hp = 100
    user.hpMax = 100
    user.x = 0
    user.y = 0
    user.accelerate = new Vector()
    this.addObject(user)
  }
  addObject (object) {
    let instance = this.getObject(object)
    if (instance) {
      // in map
      this.remove(object)
    }
    this.objects[object.class][object.id] = object
    object.on('die', () => {
      this.remove(object)
    })
  }
  getObject (object) {
    return this.objects[object.class][object.id]
  }
  // remove object
  remove (object) {
    delete this.objects[object.class][object.id]
  }
  magicAttack (object) {
    var center = object.center()
    var fire = new Fire({
      id: Guid.gen('fire'),
      x: object.x,
      y: center.y,
      accelerate: Vector.fromRadians(object.directRadians, 10)
    })
    this.addObject(fire)
    fire.on('step', () => {
      this.attackOnTouch(object, fire)
    })
    return fire
  }
  attackOnTouch (attacker, weapon) {
    for (const clazzes of Object.values(this.objects)) {
      for (const object of Object.values(clazzes)) {
        if (object === attacker) {
          continue
        }
        weapon.attack(object)
        if (!weapon.isAlive()) {
          return
        }
      }
    }
  }
  attackRange (attacker) {
    for (const clazzes of Object.values(this.objects)) {
      for (const object of Object.values(clazzes)) {
        attacker.attack(object)
      }
    }
  }
  getUser (id) {
    return this.objects['Thomas'][id]
  }
}

module.exports = GameMap
