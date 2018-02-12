"use strict";

const Game = require('../../library/Game')

class TowerDefence extends Game {
  static get nsp() {
    return "/tower-defence";
  }
}

module.exports = TowerDefence;