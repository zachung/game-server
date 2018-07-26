import PeerToPeerExchanger from './PeerToPeerExchanger'
import PeerHostSocket from './PeerHostSocket'
import PeerHostPeer from './PeerHostPeer'
import EventEmitter from 'events'

const LEAVED = 'leaved'
const JOINED = 'joined'

const E = {
  PEER_JOINED: 'peer-joined',
  PEER_LEAVED: 'peer-leaved',
  ROOM_CREATED: 'room-created',
  ROOM_CLOSED: 'room-closed',
  ROOM_ERROR: 'room-error'
}

const PE = {
  CLOSE: 'close'
}

/**
 * events:
 *   PEER_JOINED(name): some peer has been joined
 *   PEER_LEAVED(name): some peer has been leaved
 *   ROOM_CREATED(myName): room created/joined
 *   ROOM_CLOSED
 */
class Room extends EventEmitter {
  constructor () {
    super()
    this.isHosting = undefined
    this.isRoomCreated = false
    this.peers = []
    this.peersOnHandlers = []
    this.on(JOINED, this._onPeerAdd.bind(this))
    this.on(LEAVED, this._onPeerClose.bind(this))
  }

  // 設定自己名字
  setMyName (myName) {
    this.myName = myName
  }

  // 主持房間
  host (onRoomCreated) {
    this.isHosting = true
    let onPeerConnected = peer => {
      this.emit(JOINED, peer)
    }
    let holder = new PeerHostSocket(this.myName)
    holder.host(onRoomCreated, onPeerConnected)
  }

  // 加入房間
  client (roomId) {
    this.isHosting = false
    let onHostPeerConnected = peer => {
      this.emit(JOINED, peer)
      PeerHostPeer.listen(peer, onHostPeerConnected)
    }
    let holder = new PeerHostSocket(this.myName)
    holder.join(roomId, onHostPeerConnected)
      .catch(e => {
        this.emit(E.ROOM_ERROR, e)
      })
  }

  _onPeerAdd (peer) {
    console.log(peer.otherName, 'joined')
    if (this.peers.length > 0) {
      this.peers.forEach(otherPeer => {
        PeerToPeerExchanger.link(otherPeer, peer)
      })
    } else {
      if (!this.isRoomCreated) {
        // first join room
        this.emit(E.ROOM_CREATED, peer.myName)
        this.isRoomCreated = true
      }
      if (!this.isHosting) {
        // First peer is host, so if lost connect with it, no more client can join
        peer.isHost = true
        // TODO: maybe let other peer host.
        peer.on(PE.CLOSE, () => this.emit(E.ROOM_CLOSED))
      }
    }
    // 給 peer 加上之前的所有事件監聽
    this.peersOnHandlers.forEach(eventName =>
      this._peerRegistListener(peer, eventName))
    // NOTICE: peer 的 close 事件是 simple peer 內部觸發
    peer.on(PE.CLOSE, () => this.emit(LEAVED, peer))
    this.peers.push(peer)
    this.emit(E.PEER_JOINED, peer.otherName, peer.isHost)
  }

  _onPeerClose (peer) {
    console.log(peer.otherName, 'leaved')
    let peers = this.peers
    let inx = peers.indexOf(peer)
    if (inx !== -1) {
      peers.splice(inx, 1)
    }
    this.emit(E.PEER_LEAVED, peer.otherName)
  }

  /** 發送到每個 peer */
  sendToPeers (eventName, ...args) {
    this.peers.forEach(peer =>
      peer.send(this._getPeerEventName(eventName), ...args))
  }

  /** 發送訊息給單一 peer */
  sendToSinglePeer (eventName, peerName, ...args) {
    // TODO: 優化
    let peer = this.peers.find(peer => peer.otherName === peerName)
    if (!peer) {
      return false
    }
    peer.send(this._getPeerEventName(eventName), ...args)
    return true
  }

  /** 為所有 peers 加上事件驅動 */
  peersOn (eventName, fn) {
    // room 開始監聽此事件
    this.on(eventName, fn)
    // 給目前所有的 peer 加上事件監聽
    this.peers.forEach(peer => this._peerRegistListener(peer, eventName))
    // 給之後加入的 peer 註冊
    this.peersOnHandlers.push(eventName)
  }

  _getPeerEventName (eventName) {
    return 'peer-' + eventName
  }

  _peerRegistListener (peer, eventName) {
    peer.on(this._getPeerEventName(eventName),
      (...args) => this.emit(eventName, peer.otherName, ...args))
  }
}

export default Room
export { E }
