import Card from './Card'
import Hand from './Hand'
import Table from './Table'

// 洗牌
const shuffle = () => Math.random() - 0.5

class Game {
  constructor () {
    const N = 52
    this.deck = [...Array(N).keys()].map(code => new Card(code))
    this.hands = [new Hand(), new Hand(), new Hand(), new Hand()]
    this.tableSetup()
  }

  tableSetup () {
    // default sit: 0, without auction
    this.table = new Table(0)
  }

  /**
   * 發牌
   */
  distribute () {
    const deck = this.deck
    // 洗牌
    deck.sort(shuffle)

    let i = 0
    this.hands.forEach(hand => {
      // 一人13張
      hand.cards(deck.slice(i, i = i + 13))
      hand.sort()
    })

    this.tableSetup()
  }

  hand (sit) {
    return this.hands[sit]
  }

  /**
   * 出牌到牌桌上
   * @param sit
   * @param card
   */
  putOnTable (sit, card) {
    const hand = this.hand(sit)
    const curSuit = this.table.curSuit
    return new Promise((resolve, reject) => {
      if (this.table.curPlayer !== sit) {
        // 不是當前出牌者
        reject(Error('Not your turn'))
        return
      }
      if (curSuit !== undefined && card.suit !== curSuit && hand.hasSuit(curSuit)) {
        // 必須跟出花色
        reject(Error('must follow suit'))
        return
      }
      // 移除手牌
      this.hand(sit).draw(card)
      // 放上牌桌
      this.table.put(sit, card)
      resolve()
    })
  }
}

export default Game
