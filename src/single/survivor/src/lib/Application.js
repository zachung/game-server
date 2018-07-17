import { Application as PixiApplication, Graphics, display } from './PIXI'
import globalEventManager from './globalEventManager'

let app

class Application extends PixiApplication {
  constructor (...args) {
    super(...args)
    app = this
  }

  // only one instance for now
  static getApp () {
    return app
  }

  changeStage () {
    this.stage = new display.Stage()
  }

  changeScene (SceneName, params) {
    if (this.currentScene) {
      // maybe use promise for animation
      // remove gameloop?
      this.currentScene.destroy()
      this.stage.removeChild(this.currentScene)
    }

    let scene = new SceneName(params)
    this.stage.addChild(scene)
    scene.create()
    scene.on('changeScene', this.changeScene.bind(this))

    this.currentScene = scene
  }

  start (...args) {
    super.start(...args)

    // create a background make stage has width & height
    let view = this.renderer.view
    this.stage.addChild(
      new Graphics().drawRect(0, 0, view.width, view.height)
    )

    globalEventManager.setInteraction(this.renderer.plugins.interaction)

    // Start the game loop
    this.ticker.add(delta => this.gameLoop.bind(this)(delta))
  }

  gameLoop (delta) {
    // Update the current game state:
    this.currentScene.tick(delta)
  }
}

export default Application
