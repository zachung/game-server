const Ball = require('./ball')

class Floor extends Ball {
  constructor(options) {
    const defaults = {
      width: 64,
      height: 64,
      color: "#e2a4ae",
      speed: 0,
      hp: 10000,
      defence: 10000
    };
    const populated = Object.assign(defaults, options);
    super(populated);
  }
  getLocation() {
    return this.inMapLocation;
  }
  dieOnMapPre(map) {
    let loc = this.getLocation();
  }
  dieOnMapAfter(map) {
  }
}

module.exports = Floor;