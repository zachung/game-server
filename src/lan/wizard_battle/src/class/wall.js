const Ball = require('./ball')

class Wall extends Ball {
  constructor(options) {
    const defaults = {
      x: 0,
      y: 0,
      width: 99,
      height: 99,
      color: "#e2543e",
      hp: 10000,
      defence: 10000,
      damage: 40
    };
    const populated = Object.assign(defaults, options);
    super(populated);
  }
  getAttack(other, dt) {
    return this.getDamage(other.damage, dt);
  }
}

module.exports = Wall;