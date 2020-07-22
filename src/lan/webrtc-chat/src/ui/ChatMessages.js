/* global Image */
import EventEmitter from 'events'
import moment from 'moment'

const PRIVATE_MESSAGE_COLOR = 'fuchsia'

function imageMessage (msg, isReceive) {
  const container = document.createElement('div')
  const image = new Image()
  image.src = msg
  container.appendChild(image)
  // 收到圖片，不需要判斷送出的按鈕
  if (isReceive) {
    return [container, li => li]
  }
  const ok = document.createElement('button')
  const cancel = document.createElement('button')
  ok.innerHTML = 'send'
  cancel.innerHTML = 'cancel'
  container.appendChild(ok)
  container.appendChild(cancel)
  const cb = li => {
    return new Promise((resolve, reject) => {
      cancel.addEventListener('click', e => {
        li.remove()
      })
      ok.addEventListener('click', e => {
        resolve(li)
        ok.remove()
        cancel.remove()
      })
    })
  }
  return [container, cb]
}

function textMessage (msg) {
  const container = document.createElement('span')
  container.textContent = msg
  return [container, li => li]
}

class ChatMessages extends EventEmitter {
  constructor (ele) {
    super()
    this.ele = ele
  }

  addChatChild ({ msgChild, msgColor, nameChild = null, nameColor }) {
    const li = document.createElement('li')
    if (nameChild) {
      if (nameColor) {
        nameChild.style.color = nameColor
      }
      li.appendChild(document.createTextNode('['))
      li.appendChild(nameChild)
      li.appendChild(document.createTextNode(']: '))
    }
    msgChild.style.color = msgColor
    li.appendChild(msgChild)

    // 時間
    const datetimeContainer = document.createElement('span')
    datetimeContainer.textContent = moment().format('YYYY/MM/DD, hh:mm:ss A')
    datetimeContainer.classList.add('msg-time')
    li.appendChild(datetimeContainer)

    this.ele.insertBefore(li, this.ele.firstChild)
    return Promise.resolve(li)
  }

  addSystemMessage (msg, color = 'yellowgreen') {
    const msgChild = document.createElement('span')
    msgChild.textContent = msg
    this.addChatChild({
      msgChild,
      msgColor: color
    })
  }

  addChatMessage ({ name, payload, isPrivate, isReceive = true }) {
    let container
    const nameLabel = this.getNameLabel(name, null, isReceive)
    const color = isPrivate ? PRIVATE_MESSAGE_COLOR : null
    const { msg, type } = payload
    let cb
    switch (type) {
      case 'image':
        [container, cb] = imageMessage(msg, isReceive)
        break
      case 'text':
        [container, cb] = textMessage(msg)
        break
    }
    return this.addChatChild({
      msgChild: container,
      nameChild: nameLabel,
      msgColor: color,
      nameColor: color
    }).then(cb)
  }

  getNameLabel (name, color = null, isReceive = true) {
    const nameLabel = document.createElement('label')
    if (isReceive) {
      nameLabel.innerHTML = name
      // 點擊自動填入發送目標
      nameLabel.addEventListener('click', () => {
        this.emit('click-name', name)
      })
    } else {
      nameLabel.innerHTML = name
    }
    nameLabel.style.cursor = 'pointer'
    if (color) {
      nameLabel.style.color = color
    }

    return nameLabel
  }
}
export default ChatMessages
