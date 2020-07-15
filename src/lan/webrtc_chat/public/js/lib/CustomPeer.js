import EventEmitter from 'events'

class CustomPeer extends EventEmitter {
  // 通訊協定
  constructor (peer) {
    super()
    peer.on('close', () => {
      this.emit('close')
    })
    peer.on('data', json => {
      try {
        let { type, data } = JSON.parse(json)
        // console.log('receive', type)
        this.emit(type, data, peer.otherName)
      } catch (e) {
        console.error('data parse error', e)
      }
    })

    this._peer = peer
    this.myName = peer.myName
    this.otherName = peer.otherName
  }

  // local to remote
  send (messageType, data = {}) {
    let str = JSON.stringify({
      type: messageType,
      data
    })
    // console.log('send', messageType)
    this._peer.send(str)
  }

  off (...args) {
    this.removeListener(...args)
  }
}

export default CustomPeer
