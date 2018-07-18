import { Engine, Events, World } from './Matter'
import { STATIC } from '../config/constants'

let PARENT = Symbol('parent')

class MapWorld {
  constructor () {
    // physic
    let engine = Engine.create()
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

    let world = engine.world
    world.gravity.y = 0

    this.engine = engine
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
    World.add(world, body)
  }

  update (delta) {
    Engine.update(this.engine, delta)
  }
}

export default MapWorld
