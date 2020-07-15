import { copyToClipboard } from './lib/utils'
import Game from './lib/Game'
import { default as Room, E } from './lib/Room'
import NotifyHelper from './lib/NotifyHelper'
import MessageInput from './ui/MessageInput'
import ChatMessages from './ui/ChatMessages'

const myName = document.getElementById('my_name')
const hostButton = document.getElementById('host')
const joinButton = document.getElementById('join')
const copyButton = document.getElementById('copy_button')
const roomInput = document.getElementById('room_id')
const peersUl = document.getElementById('peers_ul')
const sendButton = document.getElementById('send')
const toNameInput = document.getElementById('to_name')
const messageInput = new MessageInput(document.getElementById('message'))
const chatMessages = new ChatMessages(document.getElementById('chat_messages'))
const isReadyButton = document.getElementById('is_ready')
const messageForm = document.getElementById('message_form')
const startButton = document.getElementById('start')

const CHAT_MESSAGE = 'chat-message'
const CHAT_PRIVATE_MESSAGE = 'chat-private-message'
const IS_READY = 'is-ready'
const GAME_START = 'start'

const ERROR_COLOR = 'red'

// TODO: sort peers
// TODO: leave room

const room = new Room()
room.on(E.ROOM_CREATED, onRoomCreated)
room.on(E.ROOM_CLOSED, onRoomClosed)
room.on(E.ROOM_ERROR, onRoomError)
// peers events
room.peersOn(CHAT_MESSAGE, onChatMessage)
room.peersOn(CHAT_PRIVATE_MESSAGE, onPrivateMessage)
room.peersOn(IS_READY, onPeerReady)
room.peersOn(GAME_START, onStart)

messageInput.on('paste-image', src => {
  sendMessage(toNameInput.value, {
    msg: src,
    type: 'image'
  })
})
chatMessages.on('click-name', name => {
  toNameInput.value = name
  messageInput.focus()
})

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
  chatMessages.addSystemMessage('Waiting for other clients.')
})
joinButton.addEventListener('click', () => {
  lockRoom()
  const roomId = roomInput.value
  room.client(roomId)
  // virtual peer for myself
  room.once(E.ROOM_CREATED, name => {
    onPeerJoined(name, false)
  })
  chatMessages.addSystemMessage(['Connecting to room(', roomId, ')...'].join(''))
})
copyButton.addEventListener('click', () => {
  copyToClipboard(roomInput)
})
sendButton.addEventListener('click', () => {
  sendMessage(toNameInput.value, {
    msg: messageInput.value,
    type: 'text'
  })
  // 清空輸入
  messageInput.value = ''
})
isReadyButton.addEventListener('click', () => {
  const isReady = !isReadyButton.isReady
  document.getElementById('checkbox-peer-' + myName.value).checked = isReady
  setReady(isReady)
})
// prevent default
messageForm.addEventListener('submit', e => e.preventDefault())
startButton.addEventListener('click', start)

function sendMessage (toName, payload) {
  if (toName === '') {
    // 給所有人
    room.sendToPeers(CHAT_MESSAGE, payload)

    chatMessages.addChatMessage({ name: 'me', payload, isPrivate: false, isReceive: false })
    return
  }
  if (toName === myName.value) {
    chatMessages.addSystemMessage('You can\'t talk with yourself')
    return
  }
  // 給單人
  const isSuccess = room.sendToSinglePeer(CHAT_PRIVATE_MESSAGE, toName, payload)
  if (!isSuccess) {
    chatMessages.addSystemMessage([toName, ' not in this chat.'].join(''))
    return
  }
  chatMessages.addChatMessage({ name: 'to ' + toName, payload, isPrivate: true, isReceive: false })
}

function onPeerJoined (name, isHost) {
  // 新增一筆至 peer 列表
  const li = document.createElement('li')
  const nameLabel = getNameLabel(name)
  const readyCheckbox = document.createElement('input')

  readyCheckbox.setAttribute('id', 'checkbox-peer-' + name)
  readyCheckbox.setAttribute('type', 'checkbox')
  if (isHost) {
    nameLabel.style.color = 'mediumvioletred'
  }

  li.appendChild(nameLabel)
  li.appendChild(readyCheckbox)
  peersUl.appendChild(li)
  peersUl[name] = li

  chatMessages.addSystemMessage([name, ' joined'].join(''))
  setReady(isReadyButton.isReady)
}

function getNameLabel (name, color = undefined) {
  const nameLabel = document.createElement('label')
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
  const li = peersUl[name]
  peersUl.removeChild(li)

  chatMessages.addSystemMessage([name, ' leaved'].join(''))
  checkAllPeersReady()
}

function onPeerReady (name, isReady) {
  const isReadyCheckbox = document.getElementById('checkbox-peer-' + name)
  isReadyCheckbox.checked = isReady
  // check all peers ready
  checkAllPeersReady()
}

function onRoomCreated (name) {
  chatMessages.addSystemMessage('Room connected.')
  room.on(E.PEER_JOINED, onPeerJoined)
  room.on(E.PEER_LEAVED, onPeerLeaved)
  myName.value = name
}

function onRoomClosed () {
  chatMessages.addSystemMessage('Room closed.')
}

function onRoomError (error) {
  // 房間出現錯誤，解鎖
  lockRoom(false)
  chatMessages.addSystemMessage(error, ERROR_COLOR)
}

function addChatMessage ({ name, payload, isPrivate }) {
  chatMessages.addChatMessage({ name, payload, isPrivate })
  // 顯示通知
  const body = payload.type === 'image' ? '圖片' : payload.msg
  NotifyHelper.notify({ title: name, body })
}

function lockRoom (isLock = true) {
  hostButton.disabled = isLock
  joinButton.disabled = isLock
  const name = myName.value
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
  const allChecked = !Array.from(document.querySelectorAll('[id^="checkbox-peer"]'))
    .some(checkbox => !checkbox.checked)
  if (allChecked) {
    chatMessages.addSystemMessage('all peers is ready.')
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

function onChatMessage (name, payload) {
  addChatMessage({ name, payload, isPrivate: false })
}

function onPrivateMessage (name, payload, type) {
  addChatMessage({ name, payload, isPrivate: true })
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
  const game = new Game(room)
  game.start()
  game.initPlayers()
}

/** only host can process this function */
function start () {
  room.sendToPeers(GAME_START)
  onStart()
}
