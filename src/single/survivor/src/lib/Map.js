import { Container, display, BLEND_MODES, Sprite } from './PIXI'

import { STAY, STATIC, REPLY, CEIL_SIZE, ABILITY_MOVE } from '../config/constants'
import { instanceByItemId } from './utils'
import MapGraph from './MapGraph'
import MapWorld from '../lib/MapWorld'

const pipe = (first, ...more) =>
  more.reduce((acc, curr) => (...args) => curr(acc(...args)), first)

const objectEvent = {
  place (object, placed) {
    let position = object.position
    this.addGameObject(placed, position.x, position.y)
  },
  fire (object, bullet) {
    this.addGameObject(bullet)
  },
  die (object) {
    object.say('You die.')
  }
}

/**
 * events:
 *  use: object
 */
class Map extends Container {
  constructor (scale = 1) {
    super()
    this.ceilSize = 1 * CEIL_SIZE

    this.objects = {
      [STATIC]: [],
      [STAY]: [],
      [REPLY]: []
    }
    this.map = new Container()
    this.addChild(this.map)

    // player group
    this.playerGroup = new display.Group()
    let playerLayer = new display.Layer(this.playerGroup)
    this.addChild(playerLayer)
    this.mapGraph = new MapGraph()

    // physic
    this.mapWorld = new MapWorld()
  }

  load (mapData) {
    let tiles = mapData.tiles
    let cols = mapData.cols
    let rows = mapData.rows
    let items = mapData.items

    let ceilSize = this.ceilSize

    let mapGraph = this.mapGraph

    let addGameObject = (i, j, id, params) => {
      let o = instanceByItemId(id, params)
      this.addGameObject(o, i * ceilSize, j * ceilSize)
      return [o, i, j]
    }

    let addGraph = ([o, i, j]) => mapGraph.addObject(o, i, j)

    let registerOn = ([o, i, j]) => {
      o.on('use', () => this.emit('use', o))
      o.on('fire', objectEvent.fire.bind(this, o))
      // TODO: remove map item
      // delete items[i]
      return [o, i, j]
    }

    mapGraph.beginUpdate()

    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        pipe(addGameObject, registerOn, addGraph)(i, j, tiles[j * cols + i])
      }
    }
    items.forEach(item => {
      let [ id, [i, j], params ] = item
      pipe(addGameObject, registerOn, addGraph)(i, j, id, params)
    })

    mapGraph.endUpdate()
  }

  addPlayer (player, toPosition) {
    // 註冊事件
    Object.entries(objectEvent).forEach(([eventName, handler]) => {
      let eInstance = handler.bind(this, player)
      player.on(eventName, eInstance)
      player.once('removed', player.off.bind(player, eventName, eInstance))
    })
    // 新增至地圖上
    this.addGameObject(
      player,
      toPosition[0] * this.ceilSize,
      toPosition[1] * this.ceilSize)

    // player 置頂顯示
    player.parentGroup = this.playerGroup

    // 自動找路
    // let moveAbility = player[ABILITY_MOVE]
    // if (moveAbility) {
    //   let points = ['4,1', '4,4', '11,1', '6,10']
    //   points.reduce((acc, cur) => {
    //     let path = this.mapGraph.find(acc, cur).map(node => {
    //       let [i, j] = node.id.split(',')
    //       return {x: i * this.ceilSize, y: j * this.ceilSize}
    //     })
    //     moveAbility.addPath(path)
    //     return cur
    //   })
    // }
  }

  tick (delta) {
    this.mapWorld.update(delta)
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

  // // fog 的 parent container 不能被移動(會錯位)，因此改成修改 map 位置
  // get position () {
  //   return this.map.position
  // }

  // get x () {
  //   return this.map.x
  // }

  // get y () {
  //   return this.map.y
  // }

  // set x (x) {
  //   this.map.x = x
  // }

  // set y (y) {
  //   this.map.y = y
  // }
}

export default Map
