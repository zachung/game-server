import EventEmitter from 'events'
import PeerHostSocket from './PeerHostSocket'

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
class PeerHostPeer extends PeerHostSocket {
  static listen (p, onPeerConnected) {
    return new Promise((resolve, reject) => {
      let emitter = new EventEmitter()
      emitter.myName = p.myName
      emitter.close = () => { /* blank */ }

      emitter.on('signal', data => {
        let { initiator, name } = data
        let eventName = initiator
          ? 'peer-signal-host'
          : 'peer-signal-join' + name // 加上 name 避免另一邊peer同時 listen 相同事件，造成衝突
        p.send(eventName, data)
      })
      p.on('peer-join', PeerHostSocket._onJoin.bind(null, emitter, onPeerConnected))
      p.on('peer-signal-join', PeerHostSocket._onSignalJoin.bind(null, emitter))
      p.on('peer-signal-host', PeerHostSocket._onSignalHost.bind(null, emitter, onPeerConnected))
    })
  }
}

export default PeerHostPeer
