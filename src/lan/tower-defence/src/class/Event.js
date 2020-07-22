let propagation = new WeakMap()

class Event {
  constructor (options) {
    propagation.set(this, true)
  }
  stopPropagation () {
    propagation.set(this, false)
  }
  get propagation () {
    return propagation.get(this)
  }
}

module.exports = Event
