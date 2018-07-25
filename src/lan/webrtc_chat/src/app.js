import { copyToClipboard } from './lib/utils'
import Peer from './lib/Peer'
import Game from './lib/Game'

let hostButton = document.getElementById('host')
let joinButton = document.getElementById('join')
let copyButton = document.getElementById('copyButton')
let roomInput = document.getElementById('roomId')
let errorText = document.getElementById('errorText')
let peersUl = document.getElementById('peersUl')
let sendButton = document.getElementById('send')

let peer = new Peer()
let room

hostButton.addEventListener('click', () => {
  room = peer.host(roomId => {
    roomInput.value = roomId
  })
  room.subscribe(onPeerModified)
    // .then(onConnected)
})
joinButton.addEventListener('click', () => {
  errorText.innerHTML = ''
  room = peer.client(roomInput.value)
  room.subscribe(onPeerModified)
    // .then(onConnected)
    // .catch(error => {
    //   errorText.innerHTML = error
    // })
})
copyButton.addEventListener('click', () => {
  copyToClipboard(roomInput)
})
sendButton.addEventListener('click', () => {
  room.send('A')
})

function onConnected (p) {
  let game = new Game(p)
  game.start()
  game.addPlayer()
}

function onPeerModified (peers) {
  peersUl.innerHTML = ''
  peers.forEach(peer => {
    let li = document.createElement('li')
    li.innerHTML = peer.otherName
    peersUl.appendChild(li)
  })
}
