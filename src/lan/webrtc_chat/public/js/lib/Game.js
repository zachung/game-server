import { Engine, Render, World, Bodies, Body } from './Matter'
import keyboardJS from 'keyboardjs'
import Vector from './Vector'
import { getRndInteger } from './utils'

const LEFT = 'a'
const UP = 'w'
const DOWN = 's'
const RIGHT = 'd'

const KEYS = Symbol('keys')

const KEY_IN = 'key-in'
const LOCATION = 'location'

class Position {
  constructor (x, y, fn = () => {}) {
    this._x = x
    this._y = y
    this.fn = fn
  }

  get x () {
    return this._x
  }

  get y () {
    return this._y
  }

  set x (x) {
    this._x = x
    this.fn()
  }

  set y (y) {
    this._y = y
    this.fn()
  }
}

class Game {
  constructor (room) {
    this.room = room
    this.room.peersOn(KEY_IN, (name, data) => {
      let { key, type } = data
      // TODO: 處理其他玩家的操作
      console.log(name, key, type)
    })
    this.room.peersOn(LOCATION, (name, {x, y}) => {
      let player = this.players[name]
      Body.setPosition(player, {x, y})
    })
  }

  initPlayers () {
    this.players = {}
    // other player
    this.room.peers.forEach(peer => this._addPlayer(peer.otherName))
    // myself
    let myself = this._addPlayer(this.room.myName)
    this._setup(myself)
  }

  _addPlayer (name) {
    console.log(name, 'added')
    let x = getRndInteger(25, 175)
    let y = getRndInteger(25, 175)
    let player = Bodies.rectangle(x, y, 20, 20)
    World.add(this.engine.world, [player])

    this.players[name] = player
    return player
  }

  _setup (player) {
    // observer position
    player.position = new Position(
      player.position.x,
      player.position.y,
      () => {
        this.room.sendToPeers(LOCATION, {
          x: player.position.x,
          y: player.position.y
        })
      })
    // key-in
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
        this.room.sendToPeers(KEY_IN, {
          key: e.key,
          type: e.type
        })
      }
      keyboardJS.bind(code, preHandler, e => {
        dir[code] = 0
        this.room.sendToPeers(KEY_IN, {
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
}

export default Game
