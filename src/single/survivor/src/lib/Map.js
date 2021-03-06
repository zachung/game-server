import { Container, display } from './PIXI'

import { STAY, STATIC, REPLY, CEIL_SIZE, ABILITY_KEY_FIRE, ABILITY_KEY_MOVE, ABILITY_ROTATE } from '../config/constants'
import { instanceByItemId } from './utils'
import MapWorld from '../lib/MapWorld'
import globalEventManager from '../lib/globalEventManager'

let isGameOver = false

const pipe = (first, ...more) =>
  more.reduce((acc, curr) => (...args) => curr(acc(...args)), first)

const objectEvent = {
  addObject (object, bullet) {
    this.addGameObject(bullet)
  },
  die (object) {
    isGameOver = true
    object[ABILITY_KEY_FIRE].dropBy(object)
    object[ABILITY_KEY_MOVE].dropBy(object)
    object[ABILITY_ROTATE].dropBy(object)
    object.say('You die.')
  }
}

/**
 * events:
 *  use: object
 */
class Map extends Container {
  constructor () {
    super()
    this.objects = {
      [STATIC]: [],
      [STAY]: [],
      [REPLY]: []
    }
    this.map = new Container()
    this.map.willRemoveChild = this.willRemoveChild.bind(this)
    this.addChild(this.map)

    // player group
    this.playerGroup = new display.Group()
    let playerLayer = new display.Layer(this.playerGroup)
    this.addChild(playerLayer)

    // physic
    this.mapWorld = new MapWorld()

    this.willRemoved = []
    this.life = 0
  }

  load (mapData) {
    let tiles = mapData.tiles
    let cols = mapData.cols
    let rows = mapData.rows
    let items = mapData.items

    let addGameObject = (i, j, id, params) => {
      let o = instanceByItemId(id, params)
      this.addGameObject(o, i * CEIL_SIZE, j * CEIL_SIZE)
      return [o, i, j]
    }

    let registerOn = ([o, i, j]) => {
      o.on('use', () => this.emit('use', o))
      o.on('addObject', objectEvent.addObject.bind(this, o))
      return [o, i, j]
    }

    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        pipe(addGameObject, registerOn)(i, j, tiles[j * cols + i])
      }
    }
    items.forEach(item => {
      let [ id, [i, j], params ] = item
      pipe(addGameObject, registerOn)(i, j, id, params)
    })
  }

  addPlayer (player, [i, j]) {
    // 註冊事件
    Object.entries(objectEvent).forEach(([eventName, handler]) => {
      let eInstance = handler.bind(this, player)
      player.on(eventName, eInstance)
      player.once('removed', player.off.bind(player, eventName, eInstance))
    })
    // 新增至地圖上
    this.addGameObject(player, i * CEIL_SIZE, j * CEIL_SIZE)

    // player 置頂顯示
    player.parentGroup = this.playerGroup

    this.player = player
  }

  tick (delta) {
    if (isGameOver) {
      return
    }
    this.objects[STAY].forEach(o => o.tick(delta))
    this.objects[REPLY].forEach(o => o.tick(delta))
    this.mapWorld.update(delta)
    this.willRemoved.forEach(child => {
      this.map.removeChild(child)
    })
    this.life += delta
    if (this.life % 10 < 1) {
      globalEventManager.emit('fire')
    }
  }

  addGameObject (o, x = undefined, y = undefined) {
    if (x !== undefined) {
      o.positionEx.set(x, y)
    }
    o.anchor.set(0.5, 0.5)

    let oArray = this.objects[o.type]
    oArray.push(o)
    o.once('removed', () => {
      let inx = oArray.indexOf(o)
      oArray.splice(inx, 1)
    })

    // add to world
    this.mapWorld.add(o)
    this.map.addChild(o)
  }

  setScale (scale) {
    this.scale.set(scale)
    this.mapWorld.scale(scale)
  }

  setPosition (x, y) {
    this.position.set(x, y)
  }

  debug (opt) {
    this.mapWorld.enableRender(opt)
    this.mapWorld.follow(this.player.body)
  }

  willRemoveChild (child) {
    this.willRemoved.push(child)
  }
}

export default Map
