import World from './World'
import Item from './Item'

class Game {
  constructor () {
    this.world = new World()
  }

  start () {
    const initX = 16
    const initY = 16
    return Promise.resolve()
      .then(() => {
        return this.addPlayer({ x: initX, y: initY })
      })
      .then(player => {
        this.startRender()
        return player
      })
  }

  addPlayer ({ x, y }) {
    const player = new Item('\u25C9')
    player.location = { x, y }
    return this.world.stage.cameraGoTo(x, y)
      .then(() => {
        this.world.stage.chunk.addItem(player)
        this.player = player
        return player
      })
  }

  startRender () {
    // timer for render
    setInterval(() => {
      this.world.stage.cameraGoTo(this.player.location.x, this.player.location.y)
        .catch(status => {
          if (status === 404) {
            console.log('Map limited')
            return
          }
          console.log(status)
        })
    }, 100)
  }
}

export default Game