/* global FileReader */
import EventEmitter from 'events'

class MessageInput extends EventEmitter {
  constructor (ele) {
    super()
    this.ele = ele
    this.init()
  }

  init () {
    this.ele.addEventListener('paste', (event) => {
    // only for google
      const clipboardData = (event.clipboardData || window.clipboardData)
      if (!clipboardData) {
        return
      }
      const items = clipboardData.items
      if (!items) {
        return
      }
      let item
      const types = clipboardData.types || []
      for (let i = 0; i < types.length; i++) {
        if (types[i] === 'Files') {
          item = items[i]
          break
        }
      }
      if (item && item.kind === 'file' && item.type.match(/^image\//i)) {
        var blob = item.getAsFile()
        var reader = new FileReader()
        reader.onload = e => {
          const src = e.target.result
          this.emit('paste-image', src)
        }
        reader.readAsDataURL(blob)
      }
    })
  }

  focus () {
    this.ele.focus()
  }

  get value () {
    return this.ele.value
  }

  set value (value) {
    this.ele.value = value
  }
}

export default MessageInput
