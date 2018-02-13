const Floor = require('./floor')

class Wall extends Floor {
  constructor(options) {
    const defaults = {
      x: 0,
      y: 0,
      color: "#e2543e",
      hp: 10000,
      defence: 10000
    };
    const populated = Object.assign(defaults, options);
    super(populated);
    this.class = this.constructor.name;
  }
}

module.exports = Wall;