import Item from './Item'
import Layer from './Layer'
import ChunkReader from './ChunkReader'

const empty = new Item('')
const N = 32

/**
 * 32*32 blocks
 */
class Chunk {
  constructor (offsetX, offsetY) {
    const groundLayer = new Layer(N)
    const itemLayer = new Layer(N)
    for (let r = 0; r < N; r++) {
      for (let c = 0; c < N; c++) {
        groundLayer.put(empty, r, c)
      }
    }

    this.groundLayer = groundLayer
    this.itemLayer = itemLayer
    this.offsetX = offsetX
    this.offsetY = offsetY
  }

  loadWorld () {
    this.chunkName = Chunk.getChunkName(this.offsetX, this.offsetY)
    const worldReader = new ChunkReader()
    return worldReader.load(this.chunkName, item => this.itemLayer.addChild(item))
  }

  getItem (x, y) {
    let item = undefined
    ;[this.itemLayer, this.groundLayer].some(layer => {
      item = layer.getItem(x, y)
      if (item) {
        return true
      }
    })
    return item
  }

  addItem(item) {
    const { x, y } = item.location
    item.lay = this
    this.itemLayer.addChild(item)
  }

  static getChunkName (offsetX, offsetY) {
    const WE = offsetX >= 0 ? 'E' : 'W'
    const NS = offsetY < 0 ? 'N' : 'S'
    return Math.abs(offsetX) + WE + Math.abs(offsetY) + NS
  }
}

export default Chunk
