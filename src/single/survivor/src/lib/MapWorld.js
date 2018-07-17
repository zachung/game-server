import { Engine, Events, World, Bodies } from './Matter'
import { STAY, STATIC } from '../config/constants'

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
        // console.log(o1.toString(), o2.toString())
      }
    })
    Engine.run(engine)

    let world = engine.world
    world.gravity.y = 0

    this.world = world
  }

  add (o) {
    if (o.type === STATIC) {
      return
    }
    o.addBody()
    let body = o.body
    o.once('removed', () => {
      World.remove(this.world, body)
    })
    body[PARENT] = o
    World.add(this.world, body)
  }
}

export default MapWorld
