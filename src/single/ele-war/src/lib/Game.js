import Stage from './Stage'
import Item from './Item'
import Layer from './Layer'

const N = 20

const newItem = (symbol, x, y) => {
  const item = new Item(symbol)
  item.location = { x, y }
  return item
}

class Game {
  constructor () {
    const stage = new Stage(N)
    const empty = new Item('')
    const ground = new Layer(N)
    stage.addLayer(ground)
    for (let r = 0; r < N; r++) {
      for (let c = 0; c < N; c++) {
        ground.put(empty, r, c)
      }
    }

    const objects = new Layer(N)
    stage.addLayer(objects)

    this.N = N
    this.stage = stage
    this.objects = objects
  }

  loadWorld (world) {
    world.items.forEach(loc => {
      const item = newItem(...loc)
      this.objects.addChild(item)
    })
  }

  addPlayer ({ x, y }) {
    const player = new Item('\u25C9')
    player.location = { x, y }
    this.objects.addChild(player)

    return player
  }
}

export default Game