import { copyToClipboard } from './lib/utils'
import Game from './lib/Game'
import { default as Room, E } from './lib/Room'
import NotifyHelper from './lib/NotifyHelper'
import moment from 'moment'

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
let startButton = document.getElementById('start')

const CHAT_MESSAGE = 'chat-message'
const CHAT_PRIVATE_MESSAGE = 'chat-private-message'
const IS_READY = 'is-ready'
const GAME_START = 'start'

const PRIVATE_MESSAGE_COLOR = 'fuchsia'
const ERROR_COLOR = 'red'

// TODO: sort peers
// TODO: leave room

let room = new Room()
room.on(E.ROOM_CREATED, onRoomCreated)
room.on(E.ROOM_CLOSED, onRoomClosed)
room.on(E.ROOM_ERROR, onRoomError)
// peers events
room.peersOn(CHAT_MESSAGE, onChatMessage)
room.peersOn(CHAT_PRIVATE_MESSAGE, onPrivateMessage)
room.peersOn(IS_READY, onPeerReady)
room.peersOn(GAME_START, onStart)

hostButton.addEventListener('click', () => {
  lockRoom()
  room.host(roomId => {
    roomInput.value = roomId
  })
  // show startButton
  startButton.style.display = 'inherit'
  // virtual peer for myself
  onPeerJoined(myName.value, true)
  // Then, waiting for client connect
  addSystemMessage('Waiting for other clients.')
})
joinButton.addEventListener('click', () => {
  lockRoom()
  let roomId = roomInput.value
  room.client(roomId)
  // virtual peer for myself
  room.once(E.ROOM_CREATED, name => {
    onPeerJoined(name, false)
  })
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
    if (to === myName.value) {
      addSystemMessage('You can\'t talk with yourself')
      return
    }
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
  document.getElementById('checkbox-peer-' + myName.value).checked = isReady
  setReady(isReady)
})
// prevent default
messageForm.addEventListener('submit', e => e.preventDefault())
startButton.addEventListener('click', start)

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
  setReady(isReadyButton.isReady)
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
  checkAllPeersReady()
}

function onPeerReady (name, isReady) {
  let isReadyCheckbox = document.getElementById('checkbox-peer-' + name)
  isReadyCheckbox.checked = isReady
  // check all peers ready
  checkAllPeersReady()
}

function onRoomCreated (name) {
  addSystemMessage('Room connected.')
  room.on(E.PEER_JOINED, onPeerJoined)
  room.on(E.PEER_LEAVED, onPeerLeaved)
  myName.value = name
}

function onRoomClosed () {
  addSystemMessage('Room closed.')
}

function onRoomError (error) {
  // 房間出現錯誤，解鎖
  lockRoom(false)
  addSystemMessage(error, ERROR_COLOR)
}

function addChatMessage (name, msg, isPrivate) {
  let msgContainer = document.createElement('span')
  let nameLabel = getNameLabel(name)
  msgContainer.textContent = msg
  if (isPrivate) {
    nameLabel.style.color = PRIVATE_MESSAGE_COLOR
    msgContainer.style.color = PRIVATE_MESSAGE_COLOR
  }
  addChatChild(msgContainer, nameLabel)
  // 顯示通知
  NotifyHelper.notify({title: name, body: msg})
}

function addChatChild (msgChild, nameChild = null) {
  let li = document.createElement('li')
  if (nameChild) {
    li.appendChild(document.createTextNode('['))
    li.appendChild(nameChild)
    li.appendChild(document.createTextNode(']: '))
  }
  li.appendChild(msgChild)

  // 時間
  let datetimeContainer = document.createElement('span')
  datetimeContainer.textContent = moment().format('YYYY/MM/DD, hh:mm:ss A')
  datetimeContainer.classList.add('msg-time')
  li.appendChild(datetimeContainer)

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
  if (allChecked) {
    addSystemMessage('all peers is ready.')
  }
  // set startButton enable
  startButton.disabled = !allChecked
  return allChecked
}

function setReady (isReady = false) {
  isReadyButton.isReady = isReady
  isReadyButton.innerHTML = isReady ? 'unReady' : 'Ready'
  room.sendToPeers(IS_READY, isReady)
  // check all peers ready
  checkAllPeersReady()
}

function onChatMessage (name, msg) {
  addChatMessage(name, msg, false)
}

function onPrivateMessage (name, msg) {
  addChatMessage(name, msg, true)
}

function guidGenerator () {
  return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1)
}

function onStart () {
  // clear all event before leave this page
  room.off(E.ROOM_CREATED, onRoomCreated)
  room.off(E.ROOM_CLOSED, onRoomClosed)
  room.off(E.ROOM_ERROR, onRoomError)
  room.off(E.PEER_JOINED, onPeerJoined)
  room.off(E.PEER_LEAVED, onPeerLeaved)
  room.peersOff(CHAT_MESSAGE, onChatMessage)
  room.peersOff(CHAT_PRIVATE_MESSAGE, onPrivateMessage)
  room.peersOff(IS_READY, onPeerReady)
  room.peersOff(GAME_START, onStart)
  // start the game
  let game = new Game(room)
  game.start()
  game.initPlayers()
}

/** only host can process this function */
function start () {
  room.sendToPeers(GAME_START)
  onStart()
}
