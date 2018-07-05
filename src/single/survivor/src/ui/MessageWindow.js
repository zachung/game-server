import { Text, TextStyle } from '../lib/PIXI'

import ScrollableWindow from './ScrollableWindow'
import messages from '../lib/Messages'

class MessageWindow extends ScrollableWindow {
  constructor (opt) {
    super(opt)

    let style = new TextStyle({
      fontSize: 12,
      fill: 'green',
      breakWords: true,
      wordWrap: true,
      wordWrapWidth: this.windowWidth
    })
    let text = new Text('', style)

    this.addWindowChild(text)
    this.text = text
  }

  modified () {
    this.text.text = messages.list.join('\n')
    this.updateScrollBarLength()
  }

  toString () {
    return 'message-window'
  }
}

export default MessageWindow
