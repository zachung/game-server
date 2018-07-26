import { copyToClipboard } from './lib/utils'
import Game from './lib/Game'
import { default as Room, E } from './lib/Room'

let myName = document.getElementById('my_name')
let hostButton = document.getElementById('host')
let joinButton = document.getElementById('join')
let copyButton = document.getElementById('copy_button')
let roomInput = document.getElementById('room_id')
let peersUl = document.getElementById('peers_ul')
let sendButton = document.getElementById('send')
let toNameInput = document.getElementById('to_name')
let messageInput = document.getElementById('message')
let chatMessages = document.getElementById('chat_messages')
let isReadyButton = document.getElementById('is_ready')
let messageForm = document.getElementById('message_form')

const CHAT_MESSAGE = 'chat-message'
const CHAT_PRIVATE_MESSAGE = 'chat-private-message'
const IS_READY = 'is-ready'

const PRIVATE_MESSAGE_COLOR = 'fuchsia'
const ERROR_COLOR = 'red'

// TODO: sort peers
// TODO: leave room
// TODO: virtual peer of self

let room = new Room()
room.on(E.ROOM_CREATED, name => {
  addSystemMessage('Room connected.')
  room.on(E.PEER_JOINED, onPeerJoined)
  room.on(E.PEER_LEAVED, onPeerLeaved)
  console.log('name is ' + name)
  myName.value = name
})
room.on(E.ROOM_CLOSED, () => addSystemMessage('Room closed.'))
room.on(E.ROOM_ERROR, error => {
  // 房間出現錯誤，解鎖
  lockRoom(false)
  addSystemMessage(error, ERROR_COLOR)
})
// peers events
room.peersOn(CHAT_MESSAGE, (name, msg) =>
  addChatMessage(name, msg))
room.peersOn(CHAT_PRIVATE_MESSAGE, (name, msg) =>
  addChatMessage(name, msg, true))
room.peersOn(IS_READY, (name, isReady) => {
  console.log(isReady)
  let isReadyCheckbox = document.getElementById('checkbox-peer-' + name)
  isReadyCheckbox.checked = isReady
  // check all peers ready
  checkAllPeersReady()
})

hostButton.addEventListener('click', () => {
  lockRoom()
  room.host(roomId => {
    roomInput.value = roomId
  })
  // Then, waiting for client connect
  addSystemMessage('Waiting for other clients.')
})
joinButton.addEventListener('click', () => {
  lockRoom()
  let roomId = roomInput.value
  room.client(roomId)
  addSystemMessage(['Connecting to room(', roomId, ')...'].join(''))
})
copyButton.addEventListener('click', () => {
  copyToClipboard(roomInput)
})
sendButton.addEventListener('click', () => {
  let msg = messageInput.value
  let to = toNameInput.value
  let spanContainer = document.createElement('span')
  let msgContainer = document.createElement('span')
  msgContainer.textContent = msg
  if (to !== '') {
    // 給單人
    let isSuccess = room.sendToSinglePeer(CHAT_PRIVATE_MESSAGE, to, msg)
    if (!isSuccess) {
      addSystemMessage([to, ' not in this chat.'].join(''))
      return
    }
    spanContainer.appendChild(document.createTextNode('to'))
    spanContainer.appendChild(getNameLabel(to))
    spanContainer.style.color = PRIVATE_MESSAGE_COLOR
    msgContainer.style.color = PRIVATE_MESSAGE_COLOR
  } else {
    // 給所有人
    room.sendToPeers(CHAT_MESSAGE, msg)
    spanContainer.appendChild(document.createTextNode('me'))
  }
  addChatChild(msgContainer, spanContainer)

  // 清空輸入
  messageInput.value = ''
})
isReadyButton.addEventListener('click', () => {
  let isReady = !isReadyButton.isReady
  isReadyButton.isReady = isReady
  room.sendToPeers(IS_READY, isReady)
  // check all peers ready
  checkAllPeersReady()
})
// prevent default
messageForm.addEventListener('submit', e => e.preventDefault())

function onConnected (p) {
  let game = new Game(p)
  game.start()
  game.addPlayer()
}

function onPeerJoined (name, isHost) {
  // 新增一筆至 peer 列表
  let li = document.createElement('li')
  let nameLabel = getNameLabel(name)
  let readyCheckbox = document.createElement('input')

  readyCheckbox.setAttribute('id', 'checkbox-peer-' + name)
  readyCheckbox.setAttribute('type', 'checkbox')
  if (isHost) {
    nameLabel.style.color = 'mediumvioletred'
  }

  li.appendChild(nameLabel)
  li.appendChild(readyCheckbox)
  peersUl.appendChild(li)
  peersUl[name] = li

  addSystemMessage([name, ' joined'].join(''))
}

function getNameLabel (name, color = undefined) {
  let nameLabel = document.createElement('label')
  nameLabel.innerHTML = name
  // 點擊自動填入發送目標
  nameLabel.addEventListener('click', () => {
    toNameInput.value = name
    messageInput.focus()
  })
  nameLabel.style.cursor = 'pointer'
  if (color) {
    nameLabel.style.color = color
  }

  return nameLabel
}

function onPeerLeaved (name) {
  let li = peersUl[name]
  peersUl.removeChild(li)

  addSystemMessage([name, ' leaved'].join(''))
}

function addChatMessage (name, msg, isPrivate = false) {
  let msgContainer = document.createElement('span')
  let nameLabel = getNameLabel(name)
  msgContainer.textContent = msg
  if (isPrivate) {
    nameLabel.style.color = PRIVATE_MESSAGE_COLOR
    msgContainer.style.color = PRIVATE_MESSAGE_COLOR
  }
  addChatChild(msgContainer, nameLabel)
}

function addChatChild (msgChild, nameChild = null) {
  let li = document.createElement('li')
  if (nameChild) {
    li.appendChild(document.createTextNode('['))
    li.appendChild(nameChild)
    li.appendChild(document.createTextNode(']: '))
  }
  li.appendChild(msgChild)
  chatMessages.insertBefore(li, chatMessages.firstChild)
}

function addSystemMessage (msg, color = 'yellowgreen') {
  let span = document.createElement('span')
  span.style.color = color
  span.textContent = msg
  addChatChild(span)
}

function lockRoom (isLock = true) {
  hostButton.disabled = isLock
  joinButton.disabled = isLock
  let name = myName.value
  if (name === '') {
    // 隨機產生用戶代號
    myName.value = guidGenerator()
  }
  room.setMyName(myName.value)
  // 禁止更改名字
  myName.readOnly = isLock
  // 禁止更改房號
  roomInput.readOnly = isLock
}

function checkAllPeersReady () {
  let allChecked = !Array.from(document.querySelectorAll('[id^="checkbox-peer"]'))
    .some(checkbox => !checkbox.checked)
  if (allChecked && isReadyButton.isReady) {
    addSystemMessage('all peers is ready.')
  }
}

function guidGenerator () {
  return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1)
}
