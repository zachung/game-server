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

  put (sit, card) {
    return new Promise((resolve, reject) => {
      if (this._sit !== sit) {
        reject(Error('Not your turn'))
        return
      }
      // put card in trick
      this._cards.push(card)
      // wait for next player
      this.waitingSit(round(++this._sit))
      resolve(this)
    })
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

  cards () {
    return this._trick.cards()
  }

  put (sit, card) {
    return this._trick.put(sit, card)
      .then(trick => {
        if (trick.cards().length < 4) {
          // this trick not finish
          return
        }
        const winnerSit = this.checkWinner(trick)
        // set next turn
        this._nextTrick(winnerSit)
      })
  }

  /**
   * check cards who is winner
   * @param {Trick} trick
   */
  checkWinner (trick) {
    const cards = trick.cards()
    const led = cards[0]
    const suit = Math.floor(led / 13)
    const number = led % 13
    const start = trick.start
    let winnerSit = start
    cards.forEach((card, sitOffset) => {
      const curSuit = Math.floor(card / 13)
      if (suit !== curSuit) {
        // suit not equals
        return
      }
      if (card % 13 > number) {
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
