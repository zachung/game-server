import { Text, TextStyle } from '../lib/PIXI'

import ScrollableWindow from './ScrollableWindow'
import messages from '../lib/Messages'

class MessageWindow extends ScrollableWindow {
  constructor (opt) {
    super(opt)

    let { fontSize = 12 } = opt

    let style = new TextStyle({
      fontSize: fontSize,
      fill: 'green',
      breakWords: true,
      wordWrap: true,
      wordWrapWidth: this.windowWidth
    })
    let text = new Text('', style)

    this.addWindowChild(text)
    this.text = text

    this.autoScrollToBottom = true

    messages.on('modified', this.modified.bind(this))
  }

  modified () {
    let scrollPercent = this.scrollPercent
    this.text.text = [].concat(messages.list).reverse().join('\n')
    this.updateScrollBarLength()

    // 若scroll置底，自動捲動置底
    if (scrollPercent === 1) {
      this.scrollTo(1)
    }
  }

  add (msg) {
    messages.add(msg)
  }

  toString () {
    return 'message-window'
  }
}

export default MessageWindow
