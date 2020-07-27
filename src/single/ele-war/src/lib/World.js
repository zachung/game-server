import Stage from './Stage'

const N = 32

class World {
  constructor () {
    this.stage = new Stage(N)
  }
}

export default World