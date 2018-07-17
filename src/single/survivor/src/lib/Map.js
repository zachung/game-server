import { Container, display, BLEND_MODES, Sprite } from './PIXI'

import { STAY, STATIC, REPLY, CEIL_SIZE, ABILITY_MOVE } from '../config/constants'
import { instanceByItemId } from './utils'
import MapGraph from './MapGraph'
import bump from '../lib/Bump'
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
    this.ceilSize = scale * CEIL_SIZE
    this.mapScale = scale

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

  enableFog () {
    let lighting = new display.Layer()
    lighting.on('display', function (element) {
      element.blendMode = BLEND_MODES.ADD
    })
    lighting.useRenderTexture = true
    lighting.clearColor = [0, 0, 0, 1] // ambient gray

    this.addChild(lighting)

    var lightingSprite = new Sprite(lighting.getRenderTexture())
    lightingSprite.blendMode = BLEND_MODES.MULTIPLY

    this.addChild(lightingSprite)

    this.map.lighting = lighting
  }

  // 消除迷霧
  disableFog () {
    this.lighting.clearColor = [1, 1, 1, 1]
  }

  load (mapData) {
    let tiles = mapData.tiles
    let cols = mapData.cols
    let rows = mapData.rows
    let items = mapData.items

    let ceilSize = this.ceilSize

    if (mapData.hasFog) {
      this.enableFog()
    }
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
    let objects = this.objects[REPLY]
    objects.forEach(o => o.tick(delta))

    // let collisionDetect = (o1, o2, f) => {
    //   if (!o1 || !o2 || o1 === o2) {
    //     return
    //   }
    //   if (f(o2, o1, true)) {
    //     o1.emit('collide', o2)
    //   }
    // }

    // let rectangleCollision = bump.rectangleCollision.bind(bump)
    // let collideArr = this.objects[STAY]
    // // collide detect
    // for (let i = collideArr.length - 1; i >= 0; i--) {
    //   for (let j = objects.length - 1; j >= 0; j--) {
    //     pipe(collisionDetect)(collideArr[i], objects[j], rectangleCollision)
    //   }
    // }

    // let hitTestRectangle = bump.hitTestRectangle.bind(bump)
    // collideArr = this.objects[REPLY]
    // for (let i = collideArr.length - 1; i >= 0; i--) {
    //   for (let j = objects.length - 1; j >= 0; j--) {
    //     pipe(collisionDetect)(collideArr[i], objects[j], hitTestRectangle)
    //   }
    // }
  }

  addGameObject (o, x = undefined, y = undefined) {
    let mapScale = this.mapScale
    // NOTICE: 此處的 Number 必須留著，否則字串傳入 set() 物件無法顯示
    if (x !== undefined) {
      o.position.set(x, y)
    }
    o.scale.set(mapScale, mapScale)

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

  // fog 的 parent container 不能被移動(會錯位)，因此改成修改 map 位置
  get position () {
    return this.map.position
  }

  get x () {
    return this.map.x
  }

  get y () {
    return this.map.y
  }

  set x (x) {
    this.map.x = x
  }

  set y (y) {
    this.map.y = y
  }
}

export default Map
