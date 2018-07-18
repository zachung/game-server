import Ability from './Ability'
import { ABILITY_ROTATE } from '../../config/constants'
import Vector from '../../lib/Vector'
import globalEventManager from '../../lib/globalEventManager'

const MOUSEMOVE = Symbol('mousemove')

class Rotate extends Ability {
  constructor (initRad = 0) {
    super()
    this.initRad = initRad
  }

  get type () { return ABILITY_ROTATE }

  isBetter (other) {
    return false
  }

  get faceRad () {
    return this._faceRad
  }

  // 配備此技能
  carryBy (owner) {
    super.carryBy(owner)

    this.owner = owner
    owner[ABILITY_ROTATE] = this
    owner.interactive = true
    let mouseHandler = e => {
      let ownerPoint = this.owner.getGlobalPosition()
      let pointer = e.data.global
      let vector = new Vector(
        pointer.x - ownerPoint.x,
        pointer.y - ownerPoint.y)
      globalEventManager.emit('rotate', vector)
    }
    let rotateHandler = this.setFaceRad.bind(this)

    owner[MOUSEMOVE] = {
      rotate: rotateHandler,
      mousemove: mouseHandler
    }
    Object.entries(owner[MOUSEMOVE]).forEach(([eventName, handler]) => {
      globalEventManager.on(eventName, handler)
    })

    this.setFaceRad(new Vector(0, 0))
  }

  dropBy (owner) {
    super.dropBy(owner)
    Object.entries(owner[MOUSEMOVE]).forEach(([eventName, handler]) => {
      globalEventManager.off(eventName, handler)
    })
    delete owner[MOUSEMOVE]
    delete owner[ABILITY_ROTATE]
  }

  setFaceRad (vector) {
    this._faceRad = vector.rad - this.initRad
    this.owner.rotate(this._faceRad)
  }

  toString () {
    return 'Rotate'
  }
}

export default Rotate
