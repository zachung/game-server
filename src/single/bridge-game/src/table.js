class Table {
  constructor () {
    this._cards = {}
    this._history = []
    this._turn = undefined
  }

  cards () {
    return this._cards
  }

  reset () {
    this._cards = {}
    this._history = []
  }

  put (sit, card) {
    return new Promise((resolve, reject) => {
      if (this._turn !== sit) {
        reject(Error('Not your turn'))
        return
      }
      // put card on table
      this._cards[sit] = card
      // TODO: check table cards who is winner and set next turn
      // wait for next player
      this.setTurn(++this._turn % 4)
    })
  }

  setTurn (turn) {
    this._turn = turn
  }

  waitingSit() {
    return this._turn
  }

  next () {
    this._history.push(this._cards)
    this._cards = {}
  }
}

export default Table