import { Container } from './pixi'

class Scene extends Container {
  constructor (app) {
    super()
    this.app = app
  }

  show () {
    this.app.stage.addChild(this)
  }

  dismiss () {
    this.app.stage.removeChild(this)
  }

  tick (delta) {}
}

export default Scene
