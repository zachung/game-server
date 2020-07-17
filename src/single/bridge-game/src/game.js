import Hand from './hand'
import Table from './table'

// 洗牌
const shuffle = (a, b) => Math.random() - 0.5

class Game {
  constructor () {
    const N = 52
    this.deck = [...Array(N).keys()]
    this.hands = [new Hand(), new Hand(), new Hand(), new Hand()]
    this.table = new Table()
  }

  /* 發牌 */
  distribute () {
    const deck = this.deck
    // 洗牌
    this.deck.sort(shuffle)

    this.hands = [
      new Hand(deck.slice(0, 13)),
      new Hand(deck.slice(13, 26)),
      new Hand(deck.slice(26, 39)),
      new Hand(deck.slice(39, 52))
    ]

    this.table.reset()
  }

  hand (sit) {
    return this.hands[sit]
  }
}

export default Game
