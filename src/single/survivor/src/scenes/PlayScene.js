import { loader, resources, display } from '../lib/PIXI'
import Scene from '../lib/Scene'
import Map from '../lib/Map'
import MapFog from '../lib/MapFog'
import { IS_MOBILE } from '../config/constants'

import Cat from '../objects/Cat'

import MessageWindow from '../ui/MessageWindow'
import PlayerWindow from '../ui/PlayerWindow'
import InventoryWindow from '../ui/InventoryWindow'
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

function getPlayerWindowOpt (player) {
  let opt = {
    player
  }
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

function getInventoryWindowOpt (player) {
  let opt = {
    player
  }
  opt.y = 0
  if (IS_MOBILE) {
    opt.width = sceneWidth / 6
  } else {
    let divide = sceneWidth < 400 ? 6 : sceneWidth < 800 ? 12 : 20
    opt.width = sceneWidth / divide
  }
  opt.x = sceneWidth - opt.width
  return opt
}

class PlayScene extends Scene {
  constructor ({ mapFile, position }) {
    super()

    this.mapFile = mapFile
    this.toPosition = position
    this.group.enableSort = true
    this.mapScale = IS_MOBILE ? 2 : 0.5
    this.mapFog = new MapFog()
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
    let uiGroup = new display.Group(1, true)
    let uiLayer = new display.Layer(uiGroup)
    uiLayer.parentLayer = this
    this.addChild(uiLayer)

    let messageWindow = new MessageWindow(getMessageWindowOpt())
    let playerWindow = new PlayerWindow(getPlayerWindowOpt(this.cat))
    let inventoryWindow = new InventoryWindow(getInventoryWindowOpt(this.cat))

    // 讓UI顯示在頂層
    messageWindow.parentGroup = uiGroup
    playerWindow.parentGroup = uiGroup
    inventoryWindow.parentGroup = uiGroup
    uiLayer.addChild(messageWindow)
    uiLayer.addChild(playerWindow)
    uiLayer.addChild(inventoryWindow)

    if (IS_MOBILE) {
      // 只有手機要觸控板
      // 方向控制
      let directionPanel = new TouchDirectionControlPanel({
        x: sceneWidth / 4,
        y: sceneHeight * 4 / 6,
        radius: sceneWidth / 8
      })
      directionPanel.parentGroup = uiGroup

      // 操作控制
      let operationPanel = new TouchOperationControlPanel({
        x: sceneWidth / 5 * 3,
        y: sceneHeight / 5 * 3,
        width: sceneWidth / 3,
        height: sceneHeight / 5
      })
      operationPanel.parentGroup = uiGroup

      uiLayer.addChild(directionPanel)
      uiLayer.addChild(operationPanel)
      // require('../lib/demo')
    }
    messageWindow.add(['scene size: (', sceneWidth, ', ', sceneHeight, ').'].join(''))
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
    let mapGroup = new display.Group(0, true)
    let mapLayer = new display.Layer(mapGroup)
    mapLayer.parentLayer = this
    mapLayer.group.enableSort = true
    mapLayer.position.set(sceneWidth / 2, sceneHeight / 2)
    this.addChild(mapLayer)

    let mapData = resources[fileName].data

    let map = new Map()
    mapLayer.addChild(map)
    // enable fog
    if (!mapData.hasFog) {
      this.mapFog.disable()
    } else {
      this.mapFog.enable(map)
    }
    // this.mapFog.position.set(-sceneWidth / 2, -sceneHeight / 2)
    mapLayer.addChild(this.mapFog)
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
    // TODO: debug render
    // map.debug({width: sceneWidth, height: sceneHeight})
    map.setScale(this.mapScale)
    this.map = map

    this.isMapLoaded = true
  }

  tick (delta) {
    if (!this.isMapLoaded) {
      return
    }
    this.map.tick(delta)
    // FIXME: gap between tiles on iPhone Safari
    this.map.setPosition(
      -this.cat.x * this.mapScale,
      -this.cat.y * this.mapScale)
  }
}

export default PlayScene
