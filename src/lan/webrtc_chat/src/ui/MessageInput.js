/* global FileReader, Image */
import EventEmitter from 'events'

function fetchFromPaste (clipboardData) {
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
    return item.getAsFile()
  }
}

function fetchFromDrop (event) {
  const dataTransfer = event.dataTransfer
  if (!dataTransfer) {
    return
  }
  const html = dataTransfer.getData('text/html')
  const match = html && /\bsrc="?([^"\s]+)"?\s*/.exec(html)
  const url = match && match[1]
  if (!url) {
    return Promise.resolve()
  }
  // 處理圖片，禁止 bubble text 到 input
  event.preventDefault()
  var c = document.createElement('canvas')
  var ctx = c.getContext('2d')

  return new Promise((resolve, reject) => {
    var img = new Image()
    img.onload = function () {
      c.width = this.naturalWidth // update canvas size to match image
      c.height = this.naturalHeight
      ctx.drawImage(this, 0, 0) // draw in image
      c.toBlob(function (blob) { // get content as PNG blob
      // call our main function
        resolve(blob)
      }, 'image/png')
    }
    img.onerror = function () {
      reject(Error('Error in uploading'))
    }
    img.crossOrigin = '' // if from different origin
    img.src = url
  })
}

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
      this.processImage(
        fetchFromPaste(clipboardData)
      )
    })
    this.ele.addEventListener('drop', (event) => {
      fetchFromDrop(event).then(blob => {
        this.processImage(blob)
      })
    })
  }

  processImage (blob) {
    if (!blob) {
      return
    }
    var reader = new FileReader()
    reader.onload = e => {
      const src = e.target.result
      this.emit('paste-image', src)
    }
    reader.readAsDataURL(blob)
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
