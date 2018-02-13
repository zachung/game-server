const Enemy = require('./Enemy')

class Sorlosheet extends Enemy {
  constructor(options) {
    const defaults = {
      hp: 10,
      hpMax: 10,
      width: 72,
      height: 72,
      atlases: "sorlosheet",
      defence: 0,
      mass: 0.5,
      reward: 10,
      score: 1,
      escapeFine: 1
    };
    const populated = Object.assign(defaults, options);
    super(populated);
  }
}

module.exports = Sorlosheet;