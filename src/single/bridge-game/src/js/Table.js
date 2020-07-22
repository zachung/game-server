import Hand from './Hand'

const round = sit => sit % 4

class Trick extends Hand {
  /**
   * @param {number} start 開始的輪次
   */
  constructor (start) {
    super()
    this.start = start
    this._sit = start
    this.winner = undefined
  }

  get leadSuit () {
    const lead = this._cards[0]
    return lead ? lead.suit : undefined
  }

  put (sit, card) {
    // put card in trick
    this._cards.push(card)
    const winner = this.checkWinner()
    if (winner !== undefined) {
      this.winner = winner
      return winner
    }
    // wait for next player
    this.waitingSit(round(++this._sit))
  }

  waitingSit (sit) {
    if (sit !== undefined) {
      this._sit = sit
    }
    return this._sit
  }

  /**
   * check cards who is winner
   */
  checkWinner () {
    if (this._cards.length < 4) {
      // this trick not finish
      return
    }
    const cards = this._cards
    const led = cards[0]
    const start = this.start
    let winnerSit = start
    let winCard = led
    cards.forEach((card, sitOffset) => {
      // no-trump
      if (card.suit === led.suit && card.number > winCard.number) {
        // suit equals & number is larger
        winnerSit = round(start + sitOffset)
        winCard = card
      }
    })
    return winnerSit
  }
}

class Table {
  constructor (sit) {
    this.history = []
    this._trick = new Trick(sit)
  }

  get curSit () {
    return this._trick._sit
  }

  get curSuit () {
    return this._trick.leadSuit
  }

  get cards () {
    const trick = (this._trick._cards.length !== 0 || this.history.length === 0)
      ? this._trick
      : this.history[this.history.length - 1]
    const _cards = []
    for (let i = 0; i < 4; i++) {
      _cards[round(i + trick.start)] = trick._cards[i]
    }
    return _cards
  }

  put (sit, card) {
    this._trick.put(sit, card)
    // 檢查此墩贏家
    const winnerSit = this._trick.checkWinner()
    if (winnerSit !== undefined) {
      // set next turn
      this.nextTrick(winnerSit)
    }
  }

  /**
   * wait for next sit
   * @param sit
   * @returns {*}
   */
  waitingSit (sit) {
    return this._trick.waitingSit(sit)
  }

  /**
   * next trick
   * @param sit
   */
  nextTrick (sit) {
    this.history.push(this._trick)
    this._trick = new Trick(sit)
  }

  get nsTricks () {
    return this.history.filter(trick => [0, 2].indexOf(trick.winner) !== -1).length
  }

  get weTricks () {
    return this.history.filter(trick => [1, 3].indexOf(trick.winner) !== -1).length
  }
}

export default Table
