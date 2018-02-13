class LevelData {
  constructor() {
  }
  setLevel(level) {
    this.level = level;
    this.round = 0;
    this.data = require('../levels/level1');
  }
  get enemy_path() {
    return this.data.enemy_path;
  }
  get map() {
    return this.data.map;
  }
  get roundData() {
    return this.data.round[this.round - 1];
  }
  get nextRoundData() {
    return this.data.round[this.round];
  }
  nextRound() {
    if (this.hasNextRound()) {
      this.round++;
    }
  }
  hasNextRound() {
    return this.round < this.data.round.length;
  }
}

module.exports = LevelData;