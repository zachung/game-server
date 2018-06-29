import { Text, TextStyle } from '../lib/PIXI'
import { STAY } from '../config/constants'
import Scene from '../lib/Scene'
import bump from '../lib/Bump'

// TODO: one map one file
// TODO: after switch map update position of player
import * as Map from '../config/Map'

import Cat from '../objects/Cat'
import Move from '../objects/slots/Move'

const CEIL_SIZE = 16

class PlayScene extends Scene {
  constructor ({ map, player }) {
    super()
    this.map = map
    this.cat = player
  }
  create () {
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
    let level = Map[this.map]
    level.map.forEach((row, i) => {
      row.forEach((M, j) => {
        let o = new M()
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
      let o = new item.Type(item.params)
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
          map: o.map,
          player: this.cat
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
