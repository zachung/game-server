const Game = require('../../library/Lobby')

class TowerDefence extends Game {
  static get nsp () {
    return '/tower-defence'
  }
}

module.exports = TowerDefence
