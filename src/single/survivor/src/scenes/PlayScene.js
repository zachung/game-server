import Scene from '../Scene'

import Cat from '../objects/Cat'

class PlayScene extends Scene {
  constructor (...args) {
    super(...args)
    this.cat = new Cat()

    // Add the cat to the stage
    this.addChild(this.cat)
  }

  tick (delta) {
    this.cat.tick(delta)
  }
}

export default PlayScene
