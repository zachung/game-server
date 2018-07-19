import { Engine, Events, World, Render, Mouse, MouseConstraint, Body } from './Matter'
import { STATIC } from '../config/constants'

let PARENT = Symbol('parent')

function follow (body) {
  let engine = this.engine
  let initialEngineBoundsMaxX = this.initialEngineBoundsMaxX
  let initialEngineBoundsMaxY = this.initialEngineBoundsMaxY
  let centerX = -this.center.x
  let centerY = -this.center.y
  let bounds = engine.render.bounds
  let bodyX = body.position.x
  let bodyY = body.position.y

  // Fallow Hero X
  bounds.min.x = centerX + bodyX
  bounds.max.x = centerX + bodyX + initialEngineBoundsMaxX

  // Fallow Hero Y
  bounds.min.y = centerY + bodyY
  bounds.max.y = centerY + bodyY + initialEngineBoundsMaxY

  Mouse.setOffset(this.mouseConstraint.mouse, bounds.min)
}

class MapWorld {
  constructor () {
    // physic
    let engine = Engine.create()

    let world = engine.world
    world.gravity.y = 0
    // apply force at next update
    world.forcesWaitForApply = []

    Events.on(engine, 'collisionStart', event => {
      var pairs = event.pairs
      for (let i = 0; i < pairs.length; i++) {
        let pair = pairs[i]
        let o1 = pair.bodyA[PARENT]
        let o2 = pair.bodyB[PARENT]
        o1.emit('collide', o2)
        o2.emit('collide', o1)
      }
    })
    Events.on(engine, 'beforeUpdate', event => {
      world.forcesWaitForApply.forEach(({owner, vector}) => {
        if (owner) {
          Body.applyForce(owner.body, owner.positionEx, vector)
        }
      })
      world.forcesWaitForApply = []
    })

    this.engine = engine
    this.mouseConstraint = MouseConstraint.create(engine)
    World.add(engine.world, this.mouseConstraint)
  }

  add (o) {
    if (o.type === STATIC) {
      return
    }
    let world = this.engine.world
    o.addBody()
    let body = o.body
    o.once('removed', () => {
      World.remove(world, body)
    })
    body[PARENT] = o
    body.world = world
    World.addBody(world, body)
  }

  update (delta) {
    Engine.update(this.engine, delta * 16.666)
  }

  enableRender ({width, height}) {
    let engine = this.engine
    // create a renderer
    var render = Render.create({
      element: document.body,
      engine,
      options: {
        width: width * 2,
        height: height * 2,
        wireframes: true,
        hasBounds: true,
        wireframeBackground: 'transparent'
      }
    })

    // run the renderer
    Render.run(render)
    this.engine.render = render
    this.initialEngineBoundsMaxX = render.bounds.max.x
    this.initialEngineBoundsMaxY = render.bounds.max.y
    this.center = {
      x: width / 2,
      y: height / 2
    }
  }

  follow (body) {
    Events.on(this.engine, 'beforeUpdate', follow.bind(this, body))
  }

  scale (scaleX, scaleY = scaleX) {
    Mouse.setScale(this.mouseConstraint.mouse, {
      x: this.scaleX,
      y: this.scaleY
    })
  }
}

export default MapWorld
