import { STAY } from '../config/constants'

const o = {
  get (target, property) {
    // has STAY object will return 1, otherwise 0
    if (property === 'weight') {
      return target.some(o => o.type === STAY) ? 1 : 0
    } else {
      return target[property]
    }
  }
}

class GameObjects {
  constructor (...items) {
    return new Proxy([...items], o)
  }
}

export default GameObjects
