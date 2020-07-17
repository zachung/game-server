// 排序:大到小
const handOrder = (a, b) => b - a

class Hand {
  constructor (cards = []) {
    this._cards = cards.sort(handOrder)
  }

  cards () {
    return this._cards
  }

  draw (card) {
    const indexOf = this._cards.indexOf(card)
    if (indexOf !== false) {
      return this._cards.splice(indexOf, 1)
    }
  }
}

export default Hand
