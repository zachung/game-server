/* global EZGUI */
import { Text, TextStyle, loader, resources } from '../lib/PIXI'
import Scene from '../lib/Scene'
import Map from '../lib/Map'
import Messages from '../lib/Messages'

import Cat from '../objects/Cat'
import Move from '../objects/abilities/Move'
import KeyMove from '../objects/abilities/KeyMove'
import Operate from '../objects/abilities/Operate'
import Camera from '../objects/abilities/Camera'

let sceneWidth
let sceneHeight

// TODO: make UI
class PlayScene extends Scene {
  constructor ({ map, player, position }) {
    super()
    this.isLoaded = false
    this.cat = player

    this.mapFile = 'world/' + map
    this.toPosition = position
  }

  create () {
    sceneWidth = this.parent.width
    sceneHeight = this.parent.height
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
      this.cat.takeAbility(new KeyMove())
      this.cat.takeAbility(new Camera(1))
      this.cat.width = 10
      this.cat.height = 10
    }

    this.spawnMap(resources[this.mapFile].data)
    this.addChild(this.map)
    this.map.addPlayer(this.cat, this.toPosition)

    this.tipText()

    this.isLoaded = true

    let guiObj = {
      id: 'myWindow',
      component: 'Window',
      padding: 4,
      position: {
        x: sceneWidth / 4,
        y: sceneHeight / 4
      },
      width: sceneWidth / 2,
      height: sceneHeight / 2
    }
    EZGUI.Theme.load(['assets/kenney-theme/kenney-theme.json'], () => {
      let guiContainer = EZGUI.create(guiObj, 'kenney')
      this.addChild(guiContainer)
    })
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
    this.map.position.set(
      sceneWidth / 2 - this.cat.x,
      sceneHeight / 2 - this.cat.y
    )

    this.text.text = Messages.getList().join('')
  }
}

export default PlayScene
