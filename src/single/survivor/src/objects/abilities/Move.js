import Ability from './Ability'
import { ABILITY_MOVE } from '../../config/constants'
import Vector from '../../lib/Vector'

const DISTANCE_THRESHOLD = 1

class Move extends Ability {
  constructor (value) {
    super()
    this.value = value
    this.dx = 0
    this.dy = 0
    this.path = []
    this.movingToPoint = undefined
    this.distanceThreshold = this.value * DISTANCE_THRESHOLD
  }

  get type () { return ABILITY_MOVE }

  isBetter (other) {
    // 只會加快
    return this.value > other.value
  }

  // 配備此技能
  carryBy (owner) {
    super.carryBy(owner)
    this.owner = owner
    owner[ABILITY_MOVE] = this
    owner.tickAbilities[this.type.toString()] = this
  }

  // @point 相對於 owner 的點
  setDirection (point) {
    let vector = Vector.fromPoint(point)
    let len = vector.length
    if (len === 0) {
      return
    }
    this.dx = vector.x / len * this.value
    this.dy = vector.y / len * this.value
  }

  // 移動到點
  moveTo (point) {
    this.setDirection({
      x: point.x - this.owner.x,
      y: point.y - this.owner.y
    })
  }

  // 設定移動路徑
  setPath (path) {
    if (path.length === 0) {
      // 抵達終點
      this.movingToPoint = undefined
      this.dx = 0
      this.dy = 0
      return
    }
    this.path = path
    this.movingToPoint = path.pop()
    this.moveTo(this.movingToPoint)
  }

  addPath (path) {
    this.setPath(path.concat(this.path))
  }

  // tick
  tick (delta, owner) {
    // NOTICE: 假設自己是正方形
    let scale = owner.scale.x
    owner.x += this.dx * this.value * scale * delta
    owner.y += this.dy * this.value * scale * delta
    if (this.movingToPoint) {
      let position = owner.position
      let targetPosition = this.movingToPoint
      let a = position.x - targetPosition.x
      let b = position.y - targetPosition.y
      let c = Math.sqrt(a * a + b * b)
      if (c < this.distanceThreshold) {
        this.setPath(this.path)
      } else {
        this.moveTo(this.movingToPoint)
      }
    }
  }

  toString () {
    return 'move level: ' + this.value
  }
}

export default Move
