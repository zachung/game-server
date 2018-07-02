import { CAMERA } from '../../config/constants'

class Camera {
  constructor (params) {
    this.type = CAMERA

    this.x = params[0]
    this.y = params[1]
    this.width = params[2]
    this.height = params[3]
  }

  // 是否需置換
  hasToReplace (owner) {
    let other = owner.tickAbilities[this.type]
    if (!other) {
      return true
    }
    // 只會變大
    return this.width >= other.width && this.height >= other.height
  }

  // 配備此技能
  carryBy (owner) {
    owner.tickAbilities[this.type] = this
  }

  // tick
  tick (delta, owner, map) {
    owner.x += owner.dx * this.value * delta
    owner.y += owner.dy * this.value * delta
  }
}

export default Camera
