const messages = []
const MSG_KEEP_MS = 1000

class Messages {
  static getList () {
    return messages
  }

  static add (msg) {
    messages.push(msg)
    setTimeout(messages.pop.bind(messages), MSG_KEEP_MS)
  }
}

export default Messages
