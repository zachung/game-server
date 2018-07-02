import { Container, display, BLEND_MODES, Sprite } from './PIXI'

import { STAY, CEIL_SIZE } from '../config/constants'
import { instanceByItemId } from './utils'
import bump from '../lib/Bump'

/**
 * events:
 *  use: object
 */
class Map extends Container {
  constructor () {
    super()
    this.collideObjects = []
    this.replyObjects = []

    this.once('added', this.enableFog.bind(this))
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

    this.lighting = lighting
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

    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        let id = tiles[j * cols + i]
        let o = instanceByItemId(id)
        o.position.set(i * CEIL_SIZE, j * CEIL_SIZE)
        switch (o.type) {
          case STAY:
            // 靜態物件
            this.collideObjects.push(o)
            break
        }
        this.addChild(o)
      }
    }

    items.forEach((item, i) => {
      let o = instanceByItemId(item.Type, item.params)
      o.position.set(item.pos[0] * CEIL_SIZE, item.pos[1] * CEIL_SIZE)
      switch (o.type) {
        case STAY:
          // 靜態物件
          this.collideObjects.push(o)
          break
        default:
          this.replyObjects.push(o)
      }
      o.on('take', () => {
        // destroy treasure
        this.removeChild(o)
        o.destroy()
        let inx = this.replyObjects.indexOf(o)
        this.replyObjects.splice(inx, 1)

        // remove item from the map
        delete items[i]
      })
      o.on('use', () => this.emit('use', o))
      this.addChild(o)
    })
  }

  addPlayer (player, toPosition) {
    player.position.set(
      toPosition[0] * CEIL_SIZE,
      toPosition[1] * CEIL_SIZE
    )
    this.addChild(player)

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
}

export default Map
