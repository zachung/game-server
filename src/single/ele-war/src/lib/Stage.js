class Stage {
  constructor (n) {
    this.map = []
    for (let r = 0; r < n * n; r++) {
      this.map[r] = { symbol: '' }
    }
    this.layers = []
    this.n = n
  }

  addLayer (layer) {
    this.layers.unshift(layer)
    layer.registerObserver(this)
  }

  removeLayer (layer) {
    this.layers.splice(this.layers.indexOf(layer), 1)
  }

  update (layer, x, y) {
    this.layers.some(layer => {
      const inx = y * this.n + x
      const item = layer.getItem(x, y)
      if (item) {
        this.map.splice(inx, 1, item)
        return true
      }
    })
  }
}

export default Stage
