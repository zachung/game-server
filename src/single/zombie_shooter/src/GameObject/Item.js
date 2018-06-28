import Ball from './Ball'

class Item extends Ball {
  static get gunColddown () {
    return 'gunColddown'
  }
  constructor (options = {}) {
    options.speed = 0
    options.color = '#000'
    super(options)
  }
}

export default Item
