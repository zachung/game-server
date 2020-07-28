/**
 * @property {Chunk} chunk
 * @property {string} symbol 顯示符號
 * @property {string} color 字體顏色
 * @property {string} bgColor 背景顏色
 */
class Item {
  constructor (symbol) {
    this.chunk = undefined
    this.symbol = symbol
  }

  move (x, y) {
    return this.chunk.move(this, x, y)
      .then(() => {
        this.location = { x, y }
      })
      .catch(err => {
        console.log(err.message)
      })
  }
}

export default Item