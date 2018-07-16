import Ability from './Ability'
import { ABILITY_ROTATE } from '../../config/constants'
import Vector from '../../lib/Vector'

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
    owner.anchor.set(0.5, 0.5)

    this.owner = owner
    owner[ABILITY_ROTATE] = this
    owner.interactive = true
    owner[MOUSEMOVE] = e => {
      let ownerPoint = owner.getGlobalPosition()
      let pointer = e.data.global
      let targetPosition = {
        x: pointer.x - ownerPoint.x,
        y: pointer.y - ownerPoint.y
      }
      this._faceRad = Vector.fromPoint(targetPosition).rad - this.initRad
      this.rotate(this._faceRad)
    }
    owner.on('mousemove', owner[MOUSEMOVE])
    owner.rotation = Math.PI / 2
  }

  rotate (rad) {
    this.owner.rotation = rad
  }

  toString () {
    return 'Rotate: ' + this.rad
  }
}

export default Rotate
