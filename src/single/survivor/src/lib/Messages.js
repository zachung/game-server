import EventEmitter from 'events'

const MAX_MESSAGE_COUNT = 500

class Messages extends EventEmitter {
  constructor () {
    super()
    this._messages = []
  }

  get list () {
    return this._messages
  }

  add (msg) {
    let length = this._messages.unshift(msg)
    if (length > MAX_MESSAGE_COUNT) {
      this._messages.pop()
    }
    this.emit('modified')
  }
}

export default new Messages()
