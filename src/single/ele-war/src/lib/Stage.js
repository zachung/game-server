import Chunk from './Chunk'

const chunkLoc = (x, y) => {
  return x.toString() + '_' + y.toString()
}

// 鏡頭偏移(距離左上角距離)
const CameraDelta = { x: 6, y: 6 }

class Stage {
  constructor (n) {
    this.loading = false
    this.chunks = {}

    this.map = []
    // init fallback
    for (let x = 0; x < n; x++) {
      this.map[x] = []
      for (let y = 0; y < n; y++) {
        this.map[x][y] = { symbol: '' }
      }
    }
    this.n = n
  }

  get chunk () {
    return this.chunks[this.curChunkInx]
  }

  addChunk (chunk) {
    this.chunks[chunkLoc(chunk.offsetX, chunk.offsetY)] = chunk
  }

  cameraGoTo (x, y) {
    this.cameraAt = { x, y }
    x -= CameraDelta.x
    y -= CameraDelta.y
    return this.changeChunk(x, y).then(() => {
      for (let mapX = 0; mapX < 32; mapX++) {
        for (let mapY = 0; mapY < 32; mapY++) {
          const cx = mapX + x
          const cy = mapY + y
          const item = this.getChunkItem(cx, cy)
          if (item) {
            this.map[mapY].splice(mapX, 1, item)
          }
        }
      }
    })
  }

  changeChunk (x, y) {
    const chunkX = Math.floor(x / 32)
    const chunkY = Math.floor(y / 32)
    const curChunkInx = chunkLoc(chunkX, chunkY)
    if (this.curChunkInx !== curChunkInx) {
      this.curChunkInx = curChunkInx
    }
    // check nearest chunk is loaded
    const loaders = []
    for (let x = chunkX - 1; x <= chunkX + 1; x++) {
      for (let y = chunkY - 1; y <= chunkY + 1; y++) {
        const inx = chunkLoc(x, y)
        if (!this.chunks[inx]) {
          const chunk = new Chunk(x, y)
          this.addChunk(chunk)
          loaders.push(chunk.loadWorld())
        }
      }
    }
    this.loading = true
    return Promise.all(loaders).then(() => {
      this.loading = false
    })
  }

  getChunkItem (x, y) {
    const chunkInx = chunkLoc(Math.floor(x / 32), Math.floor(y / 32))
    const offsetX = ((x % 32) + 32) % 32
    const offsetY = ((y % 32) + 32) % 32
    const chunk = this.chunks[chunkInx]
    return chunk.getItem(offsetX, offsetY)
  }
}

export default Stage
