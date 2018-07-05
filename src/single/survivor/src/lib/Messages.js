import EventEmitter from 'events'

const MSG_KEEP_MS = 5000

class Messages extends EventEmitter {
  constructor () {
    super()
    this._messages = []
  }

  get list () {
    return this._messages
  }

  add (msg) {
    this._messages.unshift(msg)
    this.emit('modified')
    setTimeout(() => {
      this._messages.pop()
      this.emit('modified')
    }, MSG_KEEP_MS)
  }
}

export default new Messages()
