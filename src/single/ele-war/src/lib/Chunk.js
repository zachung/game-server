import Item from './Item'
import Layer from './Layer'
import ChunkReader from './ChunkReader'

const empty = new Item('')
const N = 32
const round = p => ((p % N) + N) % N

/**
 * 32*32 blocks
 * @property {Stage} stage
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

  setStage (stage) {
    this.stage = stage
  }

  loadWorld () {
    this.chunkName = Chunk.getChunkName(this.offsetX, this.offsetY)
    const worldReader = new ChunkReader()
    return worldReader.load(this.chunkName, item => this.addItem(item))
  }

  getItemByGlobalLoc (x, y) {
    return this.getItem(round(x), round(y))
  }

  getItem (offsetX, offsetY) {
    let item = undefined
    ;[this.itemLayer, this.groundLayer].some(layer => {
      item = layer.getItem(offsetX, offsetY)
      if (item) {
        return true
      }
    })
    return item
  }

  addItem (item, x, y) {
    x = x !== undefined ? x : item.location.x
    y = y !== undefined ? y : item.location.y
    this.itemLayer.put(item, round(x), round(y))
    item.chunk = this
  }

  removeItem (item, x, y) {
    this.itemLayer.remove(item, round(x), round(y))
  }

  move (item, x, y) {
    return this.stage.move(this, item, x, y)
  }

  static getChunkName (offsetX, offsetY) {
    const WE = offsetX >= 0 ? 'E' : 'W'
    const NS = offsetY < 0 ? 'N' : 'S'
    return Math.abs(offsetX) + WE + Math.abs(offsetY) + NS
  }
}

export default Chunk
