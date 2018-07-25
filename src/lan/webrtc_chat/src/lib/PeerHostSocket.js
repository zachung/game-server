import SimplePeer from 'simple-peer'
import CustomPeer from './CustomPeer'
import io from 'socket.io-client'

/**
 * events of exchanger listen:
 *   connect: First connected
 *   join: Someone has intent to join
 *   signal: Other one is ready for peer link
 * events of exchanger emit:
 *   host: I want create host
 *   join: I want link other peer
 *   signal set: I already to link
 */
class PeerHostSocket {
  static _getExchanger (onPeerConnected) {
    let socket = io(window.location.toString())
    socket.on('connect', () => console.log('my name is: ' + socket.id))
    socket.on('join', PeerHostSocket._onJoin.bind(socket, onPeerConnected))
    socket.on('signal-join', PeerHostSocket._onSignalJoin.bind(socket))
    socket.on('signal-host', PeerHostSocket._onSignalHost.bind(socket, onPeerConnected))
    return socket
  }

  static host (onRoomCreated, onPeerConnected) {
    return new Promise((resolve, reject) => {
      let exchanger = PeerHostSocket._getExchanger(onPeerConnected)
      exchanger.on('connect', PeerHostSocket._onConnect.bind(exchanger, onRoomCreated))
      resolve(exchanger)
    })
  }

  static join (roomId, onPeerConnected) {
    return new Promise((resolve, reject) => {
      let exchanger = PeerHostSocket._getExchanger(onPeerConnected)
      exchanger.emit('join', roomId, reject)
      resolve(exchanger)
    })
  }

  static _onConnect (onRoomCreated) {
    this.emit('host', onRoomCreated)
  }

  static _onJoin (onPeerConnected, otherName) {
    console.log('hosting for ' + otherName)
    // new node want join
    let p = PeerHostSocket._createPeer(true, this, otherName)
    p.on('connect', () => {
      console.log('new peer connected')
      onPeerConnected(new CustomPeer(p))
    })
    this.p = p
  }

  static _onSignalJoin ({signal, otherName}) {
    let { p } = this
    p.signal(signal)
  }

  static _onSignalHost (onPeerConnected, {signal, otherName}) {
    console.log('joining ' + otherName)

    let p = PeerHostSocket._createPeer(false, this, otherName)
    p.on('connect', () => {
      // peer connected, close exchanger
      this.close()
      onPeerConnected(new CustomPeer(p))
    })
    p.signal(signal)
  }

  static _createPeer (initiator, exchanger, otherName) {
    let p = new SimplePeer({ initiator, trickle: false })

    // record name of peer
    p.myName = exchanger.id
    p.otherName = otherName
    p.on('signal', signal => {
      exchanger.emit('signal', {signal, name: p.otherName, initiator}, error => {
        throw error
      })
    })

    p.on('error', function (err) { console.log('error', err) })

    return p
  }
}

export default PeerHostSocket
