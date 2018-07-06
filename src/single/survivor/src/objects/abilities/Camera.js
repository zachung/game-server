import Ability from './Ability'
import Light from '../../lib/Light'
import { ABILITY_CAMERA } from '../../config/constants'

class Camera extends Ability {
  constructor (value) {
    super()
    this.radius = value
  }

  get type () { return ABILITY_CAMERA }

  isBetter (other) {
    // 只會變大
    return this.radius >= other.radius
  }

  // 配備此技能
  carryBy (owner) {
    super.carryBy(owner)
    if (owner.parent) {
      this.setup(owner, owner.parent)
    } else {
      owner.once('added', container => this.setup(owner, container))
    }
  }

  replacedBy (other, owner) {
    this.dropBy(owner)
  }

  setup (owner, container) {
    Light.lightOn(owner, this.radius)
    // 如果 owner 不被顯示
    owner.removed = this.onRemoved.bind(this, owner)
    owner.once('removed', owner.removed)
  }

  onRemoved (owner) {
    this.dropBy(owner)
    // owner 重新被顯示
    owner.once('added', container => this.setup(owner, container))
  }

  dropBy (owner) {
    Light.lightOff(owner)
    // remove listener
    owner.off('removed', owner.removed)
    delete owner.removed
  }

  toString () {
    return 'light area: ' + this.radius
  }
}

export default Camera
