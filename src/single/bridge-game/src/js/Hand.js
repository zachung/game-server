// 排序:大到小
const handOrder = (a, b) => b - a

class Hand {
  constructor (cards = []) {
    this._cards = cards
  }

  cards (cards) {
    if (cards !== undefined) {
      this._cards = cards
    }
    return this._cards
  }

  sort () {
    this._cards.sort(handOrder)
  }

  /* 出一張 */
  draw (card) {
    const indexOf = this._cards.indexOf(card)
    if (indexOf !== false) {
      return this._cards.splice(indexOf, 1)
    }
  }

  /* 收一張 */
  put (card) {
    this._cards.push(card)
  }

  /* 丟棄所有卡 */
  dropAll () {
    const cards = this._cards
    this._cards = []
    return cards
  }
}

export default Hand
