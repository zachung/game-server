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

  put (item, x, y) {
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
