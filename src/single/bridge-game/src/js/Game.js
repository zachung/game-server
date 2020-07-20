import Hand from './Hand'
import Table from './Table'

// 洗牌
const shuffle = () => Math.random() - 0.5

class Game {
  constructor () {
    const N = 52
    this.deck = [...Array(N).keys()]
    this.hands = [new Hand(), new Hand(), new Hand(), new Hand()]
    this.tableSetup()
  }

  tableSetup () {
    // default sit: 0, without auction
    this.table = new Table(0)
  }

  /* 發牌 */
  distribute () {
    const deck = this.deck
    // 洗牌
    deck.sort(shuffle)

    let card = 0
    this.hands.forEach(hand => {
      // 一人13張
      hand.cards(deck.slice(card, card = card + 13))
      hand.sort()
    })

    this.tableSetup()
  }

  hand (sit) {
    return this.hands[sit]
  }
}

export default Game
