import { Engine, Render, World, Bodies, Body } from './Matter'
import keyboardJS from 'keyboardjs'
import Vector from './Vector'

const LEFT = 'a'
const UP = 'w'
const DOWN = 's'
const RIGHT = 'd'

const KEYS = Symbol('keys')

class Game {
  constructor (p) {
    console.log(p)
    this.p = p
    this.p.on('keyin', (data, id) => {
      let { key, type } = data
      // TODO: 處理其他玩家的操作
      console.log(id, key, type)
    })
  }

  start () {
    // create an engine
    let engine = Engine.create()

    // create a renderer
    let render = Render.create({
      element: document.body,
      engine: engine,
      options: {
        width: 200,
        height: 200
      }
    })
    engine.world.gravity.y = 0

    // create two boxes and a ground
    let gU = Bodies.rectangle(100, 0, 200, 30, { isStatic: true })
    let gD = Bodies.rectangle(100, 200, 200, 30, { isStatic: true })
    let gL = Bodies.rectangle(0, 100, 30, 200, { isStatic: true })
    let gR = Bodies.rectangle(200, 100, 30, 200, { isStatic: true })

    // add all of the bodies to the world
    World.add(engine.world, [gU, gD, gL, gR])

    // run the engine
    Engine.run(engine)

    // run the renderer
    Render.run(render)

    this.engine = engine
  }

  setup (player) {
    let dir = {}
    let calcDir = () => {
      let vector = new Vector(-dir[LEFT] + dir[RIGHT], -dir[UP] + dir[DOWN])
      if (vector.length === 0) {
        return
      }
      vector.multiplyScalar(0.00017)
      Body.applyForce(player, player.position, vector)
    }
    let bind = code => {
      dir[code] = 0
      let preHandler = e => {
        e.preventRepeat()
        dir[code] = 1
        this.p.send('keyin', {
          key: e.key,
          type: e.type
        })
      }
      keyboardJS.bind(code, preHandler, e => {
        dir[code] = 0
        this.p.send('keyin', {
          key: e.key,
          type: e.type
        })
      })
      return preHandler
    }

    keyboardJS.setContext('ingame')
    keyboardJS.withContext('ingame', () => {
      player[KEYS] = {
        [LEFT]: bind(LEFT),
        [UP]: bind(UP),
        [RIGHT]: bind(RIGHT),
        [DOWN]: bind(DOWN)
      }
    })

    this.timer = setInterval(calcDir, 17)
  }

  addPlayer () {
    let player = Bodies.rectangle(10, 10, 20, 20)
    World.add(this.engine.world, [player])

    this.setup(player)
  }
}

export default Game
