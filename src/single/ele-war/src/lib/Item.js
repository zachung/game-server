/**
 * @property {Layer} lay
 * @property {string} symbol 顯示符號
 * @property {string} color 字體顏色
 * @property {string} bgColor 背景顏色
 */
class Item {
  constructor (symbol) {
    this.lay = undefined
    this.symbol = symbol
  }

  move (x, y) {
    // FIXME: 不能藉由 layer 移動，必須實現跨 chunk
    if (this.lay) {
      this.lay.move(this, x, y)
        .then(() => {
          this.location = { x, y }
        })
        .catch(err => {
          console.log(err.message)
        })
    } else {
      this.location = { x, y }
    }
  }
}

export default Item