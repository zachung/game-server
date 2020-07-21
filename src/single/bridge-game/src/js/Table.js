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
  }

  get leadSuit () {
    const lead = this._cards[0]
    return lead ? lead.suit : undefined
  }

  put (sit, card) {
    // put card in trick
    this._cards.push(card)
    // wait for next player
    this.waitingSit(round(++this._sit))
  }

  waitingSit (sit) {
    if (sit !== undefined) {
      this._sit = sit
    }
    return this._sit
  }
}

class Table {
  constructor (sit) {
    this.history = []
    this._trick = new Trick(sit)
  }

  get curPlayer () {
    return this._trick._sit
  }

  get curSuit () {
    return this._trick.leadSuit
  }

  cards () {
    return this._trick.cards()
  }

  put (sit, card) {
    this._trick.put(sit, card)
    if (this._trick.cards().length < 4) {
      // this trick not finish
      return
    }
    const winnerSit = this.checkWinner(this._trick)
    // set next turn
    this._nextTrick(winnerSit)
  }

  /**
   * check cards who is winner
   * @param {Trick} trick
   */
  checkWinner (trick) {
    const cards = trick.cards()
    const led = cards[0]
    const start = trick.start
    let winnerSit = start
    cards.forEach((card, sitOffset) => {
      if (led.suit !== card.suit) {
        // suit not equals
        return
      }
      if (card.number > led.number) {
        // number is larger
        winnerSit = round(start + sitOffset)
      }
    })
    return winnerSit
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
  _nextTrick (sit) {
    this.history.push(this._trick)
    this._trick = new Trick(sit)
  }
}

export default Table
