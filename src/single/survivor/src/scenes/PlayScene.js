import { Text, TextStyle, loader, resources } from '../lib/PIXI'
import { STAY } from '../config/constants'
import Scene from '../lib/Scene'
import bump from '../lib/Bump'

// TODO: after switch map update position of player
import { instanceByItemId } from '../lib/utils'

import Cat from '../objects/Cat'
import Move from '../objects/slots/Move'

const CEIL_SIZE = 16

class PlayScene extends Scene {
  constructor ({ map, player }) {
    super()
    this.cat = player

    let fileName = 'world/' + map

    // FIXME: Resource named "world/E0N0" already exists
    loader
      .add(fileName, fileName + '.json')
      .load(() => {
        this.map = resources[fileName].data
        this._create()
      })
  }
  _create () {
    // init view size
    let sideLength = Math.min(this.parent.width, this.parent.height)
    let scale = sideLength / CEIL_SIZE / 10
    // this.scale.set(scale, scale)

    this.collideObjects = []
    this.replyObjects = []

    if (!this.cat) {
      this.cat = new Cat()
      this.cat.addSlotPart(new Move(1))
      this.cat.position.set(16, 16)
      this.cat.width = 10
      this.cat.height = 10
    }

    this.spawnMap()
    this.tipText()

    this.addChild(this.cat)
  }

  spawnMap () {
    let level = this.map
    level.tiles.forEach((row, i) => {
      row.forEach((id, j) => {
        let o = instanceByItemId(id)
        o.position.set(j * CEIL_SIZE, i * CEIL_SIZE)
        switch (o.type) {
          case STAY:
            // 靜態物件
            this.collideObjects.push(o)
            break
        }
        this.addChild(o)
      })
    })

    level.items.forEach(item => {
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
      })
      o.on('use', () => {
        // tip text
        this.text.text = 'use door'
        this.emit('changeScene', PlayScene, {
          map: o.map
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
