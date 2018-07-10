import { Container, display, BLEND_MODES, Sprite } from './PIXI'

import { STAY, STATIC, CEIL_SIZE } from '../config/constants'
import { instanceByItemId } from './utils'
import bump from '../lib/Bump'

/**
 * events:
 *  use: object
 */
class Map extends Container {
  constructor (scale = 1) {
    super()
    this.ceilSize = scale * CEIL_SIZE
    this.mapScale = scale

    this.collideObjects = []
    this.replyObjects = []
    this.map = new Container()
    this.addChild(this.map)

    // player group
    this.playerGroup = new display.Group()
    let playerLayer = new display.Layer(this.playerGroup)
    this.addChild(playerLayer)
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
    let mapScale = this.mapScale

    if (mapData.hasFog) {
      this.enableFog()
    }

    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        let id = tiles[j * cols + i]
        let o = instanceByItemId(id)
        o.position.set(i * ceilSize, j * ceilSize)
        o.scale.set(mapScale, mapScale)
        switch (o.type) {
          case STAY:
            // 靜態物件
            this.collideObjects.push(o)
            break
        }
        this.map.addChild(o)
      }
    }

    items.forEach((item, i) => {
      let [ id, pos, params ] = item
      let o = instanceByItemId(id, params)
      o.position.set(pos[0] * ceilSize, pos[1] * ceilSize)
      o.scale.set(mapScale, mapScale)
      this.map.addChild(o)
      switch (o.type) {
        case STATIC:
          return
        case STAY:
          // 靜態物件
          this.collideObjects.push(o)
          break
        default:
          this.replyObjects.push(o)
      }
      o.on('use', () => this.emit('use', o))
      o.on('removed', () => {
        let inx = this.replyObjects.indexOf(o)
        this.replyObjects.splice(inx, 1)
        delete items[i]
      })
    })
  }

  addPlayer (player, toPosition) {
    player.position.set(
      toPosition[0] * this.ceilSize,
      toPosition[1] * this.ceilSize
    )
    player.scale.set(this.mapScale, this.mapScale)
    player.parentGroup = this.playerGroup
    this.map.addChild(player)

    player.onPlace = this.addGameObject.bind(this, player)
    player.on('place', player.onPlace)
    player.once('removed', () => {
      player.off('place', player.onPlace)
    })
    this.player = player
  }

  tick (delta) {
    this.player.tick(delta)

    // collide detect
    this.collideObjects.forEach(o => {
      if (bump.rectangleCollision(this.player, o, true)) {
        o.emit('collide', this.player)
      }
    })

    this.replyObjects.forEach(o => {
      if (bump.hitTestRectangle(this.player, o)) {
        o.emit('collide', this.player)
      }
    })
  }

  addGameObject (player, object) {
    let mapScale = this.mapScale
    let position = player.position
    object.position.set(position.x.toFixed(0), position.y.toFixed(0))
    object.scale.set(mapScale, mapScale)
    this.map.addChild(object)
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
