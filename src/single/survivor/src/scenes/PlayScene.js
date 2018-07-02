import { Text, TextStyle, loader, resources } from '../lib/PIXI'
import Scene from '../lib/Scene'
import Map from '../lib/Map'
import Messages from '../lib/Messages'

import Cat from '../objects/Cat'
import Move from '../objects/slots/Move'
import Operate from '../objects/slots/Operate'

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

    this.collideObjects = []
    this.replyObjects = []

    if (!this.cat) {
      this.cat = new Cat()
      this.cat.takeAbility(new Move(1))
      this.cat.takeAbility(new Operate('E0N0'))
      this.cat.width = 10
      this.cat.height = 10
    }
    this.cat.position.set(
      this.toPosition[0] * CEIL_SIZE,
      this.toPosition[1] * CEIL_SIZE
    )

    this.spawnMap(resources[this.mapFile].data)
    this.map.addPlayer(this.cat)
    this.addChild(this.map)

    this.tipText()

    this.isLoaded = true
  }

  spawnMap (mapData) {
    let map = new Map()
    map.load(mapData)

    map.on('use', o => {
      // tip text
      this.emit('changeScene', PlayScene, {
        map: o.map,
        player: this.cat,
        position: o.toPosition
      })
    })

    this.map = map
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
    this.map.tick(delta)
    this.text.text = Messages.getList().join('')
  }
}

export default PlayScene
