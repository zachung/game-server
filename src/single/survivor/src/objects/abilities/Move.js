import Ability from './Ability'
import { ABILITY_MOVE } from '../../config/constants'
import Vector from '../../lib/Vector'
import { Body } from '../../lib/Matter'

const DISTANCE_THRESHOLD = 1

class Move extends Ability {
  /**
   * 移動能力
   * @param  {int} value    移動速度
   * @param  {float} frictionAir    空間摩擦力
   */
  constructor ([value, frictionAir]) {
    super()
    this.value = value
    this.frictionAir = frictionAir
    this.vector = new Vector(0, 0)
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
  }

  replacedBy (other, owner) {
    other.vector = this.vector
    other.path = this.path
    other.movingToPoint = this.movingToPoint
  }

  // 設定方向最大速度
  setDirection (vector) {
    Body.setVelocity(this.owner.body, vector.setLength(this.value))
  }

  // 施予力
  addDirection (vector, forceDivide = 0.17) {
    let owner = this.owner
    if (!owner.body) {
      return
    }
    Body.applyForce(
      owner.body,
      owner.position,
      vector.multiplyScalar(this.value * forceDivide / 1000))
  }

  // 移動到點
  moveTo (point) {
    let vector = new Vector(point.x - this.owner.x, point.y - this.owner.y)
    this.setDirection(vector)
  }

  // 設定移動路徑
  setPath (path) {
    if (path.length === 0) {
      // 抵達終點
      this.movingToPoint = undefined
      this.vector = new Vector(0, 0)
      return
    }
    this.path = path
    this.movingToPoint = path.pop()
    this.moveTo(this.movingToPoint)
  }

  clearPath () {
    this.movingToPoint = undefined
    this.path = []
  }

  addPath (path) {
    this.setPath(path.concat(this.path))
  }

  toString () {
    return 'move level: ' + this.value
  }
}

export default Move
