import { loader, resources } from '../lib/PIXI'
import Scene from '../lib/Scene'
import Map from '../lib/Map'
import messages from '../lib/Messages'

import Cat from '../objects/Cat'
import Move from '../objects/abilities/Move'
import KeyMove from '../objects/abilities/KeyMove'
import Operate from '../objects/abilities/Operate'
import Camera from '../objects/abilities/Camera'

import MessageWindow from '../ui/MessageWindow'

let sceneWidth
let sceneHeight

// TODO: make UI
class PlayScene extends Scene {
  constructor ({ mapFile, position }) {
    super()

    this.mapFile = mapFile
    this.toPosition = position
  }

  create () {
    sceneWidth = this.parent.width
    sceneHeight = this.parent.height
    this.isMapLoaded = false
    this.initUi()
    this.initPlayer()
    this.loadMap()
  }

  initUi () {
    let messageWindow = new MessageWindow({
      width: 200,
      height: 100,
      x: 0,
      y: 0,
      boundary: {
        x: this.x,
        y: this.y,
        width: sceneWidth,
        height: sceneHeight
      },
      enableDraggable: true
    })
    messages.on('modified', messageWindow.modified.bind(messageWindow))
    // 讓UI顯示在頂層
    messageWindow.parentLayer = this
    this.addChild(messageWindow)
    this.messageWindow = messageWindow
    setInterval(() => {
      messages.add('讓UI顯示在頂層讓UI顯示在頂層讓UI顯示在頂層')
    }, 1000)
  }

  initPlayer () {
    if (!this.cat) {
      this.cat = new Cat()
      this.cat.takeAbility(new Move(1))
      this.cat.takeAbility(new Operate('E0N0'))
      this.cat.takeAbility(new KeyMove())
      this.cat.takeAbility(new Camera(1))
      this.cat.width = 10
      this.cat.height = 10
    }
  }

  loadMap () {
    let fileName = 'world/' + this.mapFile

    // if map not loaded yet
    if (!resources[fileName]) {
      loader
        .add(fileName, fileName + '.json')
        .load(this.spawnMap.bind(this, fileName))
    } else {
      this.spawnMap(fileName)
    }
  }

  spawnMap (fileName) {
    let mapData = resources[fileName].data

    let map = new Map()
    map.load(mapData)

    map.on('use', o => {
      this.isMapLoaded = false
      this.mapFile = o.map
      this.toPosition = o.toPosition
      this.loadMap()
    })

    this.addChild(map)
    map.addPlayer(this.cat, this.toPosition)
    this.map = map

    this.isMapLoaded = true
  }

  tick (delta) {
    if (!this.isMapLoaded) {
      return
    }
    this.map.tick(delta)
    this.map.position.set(
      sceneWidth / 2 - this.cat.x,
      sceneHeight / 2 - this.cat.y
    )
  }
}

export default PlayScene
