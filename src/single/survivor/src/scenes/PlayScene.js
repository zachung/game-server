import { loader, resources, display } from '../lib/PIXI'
import Scene from '../lib/Scene'
import Map from '../lib/Map'
import { IS_MOBILE } from '../config/constants'

import Cat from '../objects/Cat'
import Move from '../objects/abilities/Move'
import KeyMove from '../objects/abilities/KeyMove'
import Operate from '../objects/abilities/Operate'
import Camera from '../objects/abilities/Camera'

import MessageWindow from '../ui/MessageWindow'
import PlayerWindow from '../ui/PlayerWindow'
import TouchControlPanel from '../ui/TouchControlPanel'

let sceneWidth
let sceneHeight

function getMessageWindowOpt () {
  let opt = {}
  if (IS_MOBILE) {
    opt.width = sceneWidth
    opt.fontSize = opt.width / 30
    opt.scrollBarWidth = 50
    opt.scrollBarMinHeight = 70
  } else {
    opt.width = sceneWidth < 400 ? sceneWidth : sceneWidth / 2
    opt.fontSize = opt.width / 60
  }
  opt.height = sceneHeight / 6
  opt.x = 0
  opt.y = sceneHeight - opt.height

  return opt
}

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
    this.loadMap()
    this.initPlayer()
    this.initUi()
  }

  initUi () {
    let uiGroup = new display.Group(0, true)
    let uiLayer = new display.Layer(uiGroup)
    uiLayer.parentLayer = this
    uiLayer.group.enableSort = true
    this.addChild(uiLayer)

    let messageWindow = new MessageWindow(getMessageWindowOpt())
    // 讓UI顯示在頂層
    messageWindow.parentGroup = uiGroup
    messageWindow.add(['scene size: (', sceneWidth, ', ', sceneHeight, ').'].join(''))

    let playerWindow = new PlayerWindow({
      x: 0,
      y: 0,
      width: 100,
      height: 80,
      player: this.cat
    })

    uiLayer.addChild(messageWindow)
    uiLayer.addChild(playerWindow)

    if (IS_MOBILE) {
      let touchControlPanel = new TouchControlPanel({
        x: sceneWidth / 4,
        y: sceneHeight * 4 / 6,
        radius: sceneWidth / 10
      })
      touchControlPanel.parentGroup = uiGroup

      uiLayer.addChild(touchControlPanel)
      // require('../lib/demo')
    }
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
      // clear old map
      this.removeChild(this.map)
      this.map.destroy()

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
