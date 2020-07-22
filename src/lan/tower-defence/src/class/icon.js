const Ball = require('./ball')

class Icon extends Ball {
  constructor (options) {
    const defaults = {
      color: '#60a030'
    }
    const populated = Object.assign(defaults, options)
    super(populated)
  }
}

module.exports = Icon
