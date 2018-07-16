import Ability from './Ability'
import { ABILITY_MOVE } from '../../config/constants'
import Vector from '../../lib/Vector'

const DISTANCE_THRESHOLD = 1

class Move extends Ability {
  /**
   * 移動能力
   * @param  {int} value    移動速度
   * @param  {Number} friction 摩擦力(1: 最大，0: 最小)
   */
  constructor ([value, friction]) {
    super()
    this.value = value
    this.vector = new Vector(0, 0)
    this.friction = friction
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

  replacedBy (other, owner) {
    other.vector = this.vector
    other.path = this.path
    other.movingToPoint = this.movingToPoint
  }

  // 設定方向最大速度
  setDirection (vector) {
    if (vector.length === 0) {
      return
    }
    this.vector = Vector.fromRadLength(vector.rad, 1)
  }

  // 緩慢加速，呼叫60次可達全速
  addDirection (vector) {
    let len = this.value / 60
    vector.setLength(len)
    this.vector.add(vector)

    let maxValue = this.value
    // 不可超出最高速度
    if (this.vector.length > maxValue) {
      this.vector.setLength(maxValue)
    }
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

  // tick
  tick (delta, owner) {
    // NOTICE: 假設自己是正方形
    let scale = owner.scale.x
    let vector = this.vector

    // 摩擦力
    this.vector.add(this.vector.clone().invert().multiplyScalar(this.friction))

    owner.x += vector.x * this.value * scale * delta
    owner.y += vector.y * this.value * scale * delta

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
