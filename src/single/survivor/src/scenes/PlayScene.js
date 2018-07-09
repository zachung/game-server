import { loader, resources, display } from '../lib/PIXI'
import Scene from '../lib/Scene'
import Map from '../lib/Map'
import { IS_MOBILE } from '../config/constants'

import Cat from '../objects/Cat'

import MessageWindow from '../ui/MessageWindow'
import PlayerWindow from '../ui/PlayerWindow'
import TouchDirectionControlPanel from '../ui/TouchDirectionControlPanel'
import TouchOperationControlPanel from '../ui/TouchOperationControlPanel'

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

function getPlayerWindowOpt () {
  let opt = {}
  opt.x = 0
  opt.y = 0
  if (IS_MOBILE) {
    opt.width = sceneWidth / 4
    opt.height = sceneHeight / 6
    opt.fontSize = opt.width / 10
  } else {
    opt.width = sceneWidth < 400 ? sceneWidth / 2 : sceneWidth / 4
    opt.height = sceneHeight / 3
    opt.fontSize = opt.width / 20
  }
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

    let playerWindow = new PlayerWindow(Object.assign({
      player: this.cat
    }, getPlayerWindowOpt()))

    uiLayer.addChild(messageWindow)
    uiLayer.addChild(playerWindow)

    if (IS_MOBILE) {
      // 只有手機要觸控板
      // 方向控制
      let directionPanel = new TouchDirectionControlPanel({
        x: sceneWidth / 4,
        y: sceneHeight * 4 / 6,
        radius: sceneWidth / 10
      })
      directionPanel.parentGroup = uiGroup

      // 操作控制
      let operationPanel = new TouchOperationControlPanel({
        x: sceneWidth / 4 * 3,
        y: sceneHeight * 4 / 6,
        radius: sceneWidth / 10
      })
      operationPanel.parentGroup = uiGroup

      uiLayer.addChild(directionPanel)
      uiLayer.addChild(operationPanel)
      // require('../lib/demo')
    }
  }

  initPlayer () {
    if (!this.cat) {
      this.cat = new Cat()
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
    let mapScale = IS_MOBILE ? 2 : 0.5

    let map = new Map(mapScale)
    this.addChild(map)
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

    map.addPlayer(this.cat, this.toPosition)
    this.map = map

    this.isMapLoaded = true
  }

  tick (delta) {
    if (!this.isMapLoaded) {
      return
    }
    this.map.tick(delta)
    // FIXME: gap between tiles on iPhone Safari
    this.map.position.set(
      Math.floor(sceneWidth / 2 - this.cat.x),
      Math.floor(sceneHeight / 2 - this.cat.y)
    )
  }
}

export default PlayScene
