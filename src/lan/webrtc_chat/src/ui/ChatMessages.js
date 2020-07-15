/* global Image */
import EventEmitter from 'events'
import moment from 'moment'

const PRIVATE_MESSAGE_COLOR = 'fuchsia'

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
    if (type === 'image') {
      container = new Image()
      container.src = msg
    } else {
      container = document.createElement('span')
      container.textContent = msg
    }
    this.addChatChild({
      msgChild: container,
      nameChild: nameLabel,
      msgColor: color,
      nameColor: color
    })
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
