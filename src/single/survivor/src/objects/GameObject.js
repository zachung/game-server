import { Sprite, ObservablePoint } from '../lib/PIXI'
import { Bodies, Body } from '../lib/Matter'
import { STAY, STATIC, ABILITY_MOVE } from '../config/constants'
import messages from '../lib/Messages'

function onScale () {
  this.scale.copy(this.scaleEx)
  if (this.body) {
    Body.scale(this.body, this.scaleEx.x, this.scaleEx.y)
  }
}

function onPosition () {
  let position = this.positionEx
  this.position.copy(position)
  if (this.body) {
    this.body.position.copy(position)
  }
}

function bodyOpt () {
  let moveAbility = this[ABILITY_MOVE]
  let friction = (moveAbility && moveAbility.friction !== undefined)
    ? moveAbility.friction
    : 0.1
  let frictionAir = (moveAbility && moveAbility.frictionAir !== undefined)
    ? moveAbility.frictionAir
    : 0.01
  let mass = this.mass ? this.mass : 1
  return {
    isStatic: this.type === STAY,
    friction,
    frictionAir,
    frictionStatic: friction,
    mass
  }
}

class GameObject extends Sprite {
  constructor (...args) {
    super(...args)
    this.scaleEx = new ObservablePoint(onScale, this)
    this.positionEx = new ObservablePoint(onPosition, this)
  }
  get type () { return STATIC }

  bodyOpt () {
    return {}
  }

  addBody () {
    if (this.body) {
      return
    }
    let opt = Object.assign(bodyOpt.call(this), this.bodyOpt())
    let body = Bodies.rectangle(this.x, this.y, this.width, this.height, opt)
    // sync physic body & display position
    body.position = this.positionEx
    this.body = body
  }

  rotate (rad, delta = false) {
    this.rotation = delta ? this.rotation + rad : rad
    if (this.body) {
      Body.setAngle(this.body, rad)
    }
  }

  say (msg) {
    messages.add(msg)
  }

  tick (delta) {}
}

export default GameObject
