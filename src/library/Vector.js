const Victor = require('victor')

if (!Victor.fromRadians) {
  Victor.fromRadians = (radians, radius) => {
    return new Victor(
      radius * Math.cos(radians),
      radius * Math.sin(radians)
    );
  }
}

module.exports = Victor;