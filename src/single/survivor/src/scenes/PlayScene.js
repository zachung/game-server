import { Text, TextStyle, loader, resources } from '../lib/PIXI'
import { STAY } from '../config/constants'
import Scene from '../lib/Scene'
import bump from '../lib/Bump'

import { instanceByItemId } from '../lib/utils'

import Cat from '../objects/Cat'
import Move from '../objects/slots/Move'

const CEIL_SIZE = 16

class PlayScene extends Scene {
  constructor ({ map, player, position }) {
    super()
    this.isLoaded = false
    this.cat = player

    this.mapFile = 'world/' + map
    this.toPosition = position
  }

  create () {
    let fileName = this.mapFile

    // if map not loaded yet
    if (!resources[fileName]) {
      loader
        .add(fileName, fileName + '.json')
        .load(this.onLoaded.bind(this))
    } else {
      this.onLoaded()
    }
  }

  onLoaded () {
    // init view size
    // let sideLength = Math.min(this.parent.width, this.parent.height)
    // let scale = sideLength / CEIL_SIZE / 10
    // this.scale.set(scale, scale)

    this.map = resources[this.mapFile].data

    this.collideObjects = []
    this.replyObjects = []

    if (!this.cat) {
      this.cat = new Cat()
      this.cat.addSlotPart(new Move(1))
      this.cat.width = 10
      this.cat.height = 10
    }
    this.cat.position.set(
      this.toPosition[0] * CEIL_SIZE,
      this.toPosition[1] * CEIL_SIZE
    )

    this.spawnMap()
    this.tipText()

    this.addChild(this.cat)

    this.isLoaded = true
  }

  spawnMap () {
    let level = this.map
    let tiles = level.tiles
    let cols = level.cols
    let rows = level.rows

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

    level.items.forEach((item, i) => {
      let o = instanceByItemId(item.Type, item.params)
      o.position.set(item.pos[0] * CEIL_SIZE, item.pos[1] * CEIL_SIZE)
      this.replyObjects.push(o)
      o.on('take', () => {
        // tip text
        this.text.text = o.toString()

        // destroy treasure
        this.removeChild(o)
        o.destroy()
        let inx = this.replyObjects.indexOf(o)
        this.replyObjects.splice(inx, 1)

        // remove item from the map
        delete level.items[i]
      })
      o.on('use', () => {
        // tip text
        this.text.text = 'use door'
        this.emit('changeScene', PlayScene, {
          map: o.map,
          player: this.cat,
          position: o.toPosition
        })
      })
      this.addChild(o)
    })
  }

  tipText () {
    let style = new TextStyle({
      fontSize: 12,
      fill: 'white'
    })
    this.text = new Text('', style)
    this.text.x = 100

    this.addChild(this.text)
  }

  tick (delta) {
    if (!this.isLoaded) {
      return
    }
    this.cat.tick(delta)

    // collide detect
    this.collideObjects.forEach(o => {
      if (bump.rectangleCollision(this.cat, o, true)) {
        o.emit('collide', this.cat)
      }
    })

    this.replyObjects.forEach(o => {
      if (bump.hitTestRectangle(this.cat, o)) {
        o.emit('collide', this.cat)
      }
    })
  }
}

export default PlayScene
