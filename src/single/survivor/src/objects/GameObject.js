import { Sprite } from '../lib/PIXI'
import { Bodies } from '../lib/Matter'
import { STAY, STATIC, ABILITY_MOVE } from '../config/constants'
import messages from '../lib/Messages'

class GameObject extends Sprite {
  get type () { return STATIC }
  say (msg) {
    messages.add(msg)
  }

  addBody () {
    if (this.body) {
      return
    }
    let moveAbility = this[ABILITY_MOVE]
    let friction = (moveAbility && moveAbility.friction !== undefined)
      ? moveAbility.friction
      : 0.1
    let frictionAir = (moveAbility && moveAbility.frictionAir !== undefined)
      ? moveAbility.frictionAir
      : 0.01
    console.log(friction, frictionAir)
    let mass = this.mass ? this.mass : 1
    let body = Bodies.rectangle(this.x, this.y, this.width, this.height, {
      isStatic: this.type === STAY,
      frictionStatic: friction,
      frictionAir: frictionAir,
      friction,
      mass: mass
    })
    body.position = this.position
    this.body = body
  }

  tick (delta) {}
}

export default GameObject
