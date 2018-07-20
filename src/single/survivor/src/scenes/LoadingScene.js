import { Text, TextStyle, loader, Container } from '../lib/PIXI'
import Window from '../ui/Window'
import Button from '../ui/Button'
import Scene from '../lib/Scene'
import PlayScene from './PlayScene'

let sceneWidth
let sceneHeight

let text = 'loading'

class LoadingScene extends Scene {
  constructor () {
    super()

    this.life = 0
    this.isLoading = false
    this.isLoaded = false
  }

  create () {
    sceneWidth = this.parent.width
    sceneHeight = this.parent.height
    this.showMain()
    this.startSingle()
  }

  showMain () {
    let mainContainer = new Container()
    mainContainer.position.set(sceneWidth / 4, sceneHeight / 4)

    let mainWindow = new Window({
      x: 0,
      y: 0,
      width: sceneWidth / 2,
      height: sceneHeight / 2
    })

    let buttonStart = new Button({
      x: mainWindow.width / 4,
      y: 10,
      width: mainWindow.width * 0.5,
      height: mainWindow.height * 0.25,
      literal: 'Single',
      on: this.startSingle.bind(this)
    })

    let buttonMulti = new Button({
      x: mainWindow.width / 4,
      y: buttonStart.y + buttonStart.height + 10,
      width: mainWindow.width * 0.5,
      height: mainWindow.height * 0.25,
      literal: 'Multi',
      on: this.startMulti.bind(this)
    })

    let fontSize = sceneWidth / 20
    let style = new TextStyle({
      fontFamily: 'Arial',
      fontSize: fontSize,
      fill: '#ff3300'
    })
    let textLoading = new Text(text, style)
    textLoading.anchor.set(1, 1)
    textLoading.position.set(
      mainWindow.width - fontSize / 2, mainWindow.height - fontSize / 2)
    textLoading.visible = false

    mainContainer.addChild(mainWindow)
    mainContainer.addChild(buttonStart)
    mainContainer.addChild(buttonMulti)
    mainContainer.addChild(textLoading)
    this.addChild(mainContainer)

    this.textLoading = textLoading
  }

  startSingle () {
    this.showLoading()
    this.startLoad()
    let timer
    timer = setInterval(() => {
      if (this.isLoaded) {
        clearInterval(timer)
        this.emit('changeScene', PlayScene, {
          mapFile: 'W0N0',
          position: [1, 1]
        })
      }
    }, 1000)
  }

  startMulti () {
    this.textLoading.text = 'not support now'
    this.showLoading()
  }

  showLoading () {
    this.textLoading.visible = true
  }

  startLoad () {
    this.isLoading = true
    // load an image and run the `setup` function when it's done
    loader
      .add('images/terrain_atlas.json')
      .add('images/base_out_atlas.json')
      .add('images/fire_bolt.png')
      .load(() => {
        this.isLoading = false
        this.isLoaded = true
      })
  }

  tick (delta) {
    this.life += delta / 30 // blend speed
    if (this.isLoading) {
      this.textLoading.text = text + Array(Math.floor(this.life) % 4 + 1).join('.')
    }
  }
}

export default LoadingScene
