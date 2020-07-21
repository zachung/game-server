class Card {
  constructor (code) {
    this.code = code
  }

  get suit () {
    return Math.floor(this.code / 13)
  }

  get number () {
    return this.code % 13
  }
}

export default Card
