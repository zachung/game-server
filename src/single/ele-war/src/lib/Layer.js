class Layer {
  constructor (n) {
    const map = []
    const N = n * n
    for (let r = 0; r < N; r++) {
      map.push(undefined)
    }
    this.map = map
    this.n = n
  }

  getItem (x, y) {
    return this.map[y * this.n + x]
  }

  move (item, x, y) {
    const { x: preX, y: preY } = item.location
    return Promise.resolve().then(() => {
      this.put(item, x, y)
      this.remove(item, preX, preY)
    })
  }

  addChild (item) {
    const { x, y } = item.location
    item.lay = this
    this.put(item, x, y)
  }

  put (item, x, y) {
    if (x < 0 || x >= this.n || y < 0 || y >= this.n) {
      throw Error('invalid location')
    }
    const inx = y * this.n + x
    const preItem = this.map[inx]
    if (preItem) {
      // TODO: 與目標交互
      throw Error('stuck by ' + preItem.symbol)
    }
    this.map.splice(inx, 1, item)
  }

  remove (item, x, y) {
    const inx = y * this.n + x
    this.map.splice(inx, 1, undefined)
  }
}

export default Layer
