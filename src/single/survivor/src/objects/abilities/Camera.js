import { Graphics } from '../../lib/PIXI'

import { ABILITY_CAMERA, CEIL_SIZE } from '../../config/constants'

const LIGHT = Symbol('light')

class Camera {
  constructor (value) {
    this.type = ABILITY_CAMERA

    this.radius = value
  }

  // 是否需置換
  hasToReplace (owner) {
    let other = owner.abilities[this.type]
    if (!other) {
      return true
    }
    // 只會變大
    return this.radius >= other.radius
  }

  // 配備此技能
  carryBy (owner) {
    let ability = owner.abilities[this.type]
    if (ability) {
      // remove pre light
      this.dropBy(owner)
    }
    owner.abilities[this.type] = this

    if (owner.parent) {
      this.setup(owner, owner.parent)
    } else {
      owner.once('added', container => this.setup(owner, container))
    }
  }

  setup (owner, container) {
    var lightbulb = new Graphics()
    var rr = 0xff
    var rg = 0xff
    var rb = 0xff
    var rad = this.radius / owner.scale.x * CEIL_SIZE

    let x = owner.width / 2 / owner.scale.x
    let y = owner.height / 2 / owner.scale.y
    lightbulb.beginFill((rr << 16) + (rg << 8) + rb, 1.0)
    lightbulb.drawCircle(x, y, rad)
    lightbulb.endFill()
    lightbulb.parentLayer = container.lighting // must has property: lighting

    owner[LIGHT] = lightbulb
    owner.addChild(lightbulb)

    owner.removed = this.onRemoved.bind(this, owner)
    owner.once('removed', owner.removed)
  }

  dropBy (owner) {
    this.removeCamera(owner)
  }

  onRemoved (owner) {
    this.removeCamera(owner)
    owner.once('added', container => this.setup(owner, container))
  }

  removeCamera (owner) {
    // remove light
    owner.removeChild(owner[LIGHT])
    delete owner[LIGHT]
    // remove listener
    owner.off('removed', this.removed)
    delete owner.removed
  }

  toString () {
    return 'light area: ' + this.radius
  }
}

export default Camera
