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
  constructor (myName) {
    this.myName = myName
  }

  _getExchanger (onPeerConnected) {
    let socket = io(window.location.toString())
    socket.on('join', PeerHostSocket._onJoin.bind(this, socket, onPeerConnected))
    socket.on('signal-join', PeerHostSocket._onSignalJoin.bind(this, socket))
    socket.on('signal-host', PeerHostSocket._onSignalHost.bind(this, socket, onPeerConnected))
    socket.myName = this.myName
    return socket
  }

  host (onRoomCreated, onPeerConnected) {
    return new Promise((resolve, reject) => {
      let exchanger = this._getExchanger(onPeerConnected)
      exchanger.on('connect', () => {
        exchanger.emit('host', this.myName, onRoomCreated)
      })
      resolve(exchanger)
    })
  }

  join (roomId, onPeerConnected) {
    return new Promise((resolve, reject) => {
      let exchanger = this._getExchanger(onPeerConnected)
      exchanger.emit('join', roomId, this.myName, (err, myName) => {
        if (err) {
          reject(err)
          return
        }
        // server 有可能會更改名字，所以要接受新名字
        exchanger.myName = myName
        resolve(exchanger)
      })
    })
  }

  static _onJoin (exchanger, onPeerConnected, otherName) {
    console.log('hosting for ' + otherName)
    // new node want join
    let p = PeerHostSocket._createPeer(true, exchanger, otherName)
    p.on('connect', () => {
      console.log('new peer connected')
      onPeerConnected(new CustomPeer(p))
    })
    exchanger.p = p
  }

  static _onSignalJoin (exchanger, {signal, otherName}) {
    exchanger.p.signal(signal)
  }

  static _onSignalHost (exchanger, onPeerConnected, {signal, otherName}) {
    console.log('joining ' + otherName)

    let p = PeerHostSocket._createPeer(false, exchanger, otherName)
    p.on('connect', () => {
      // peer connected, close exchanger
      exchanger.close()
      onPeerConnected(new CustomPeer(p))
    })
    p.signal(signal)
  }

  static _createPeer (initiator, exchanger, otherName) {
    let p = new SimplePeer({ initiator, trickle: false })

    // record name of peer
    p.myName = exchanger.myName
    console.log('my name is' + p.myName)
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
