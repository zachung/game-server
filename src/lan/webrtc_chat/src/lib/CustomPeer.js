import EventEmitter from 'events'

class CustomPeer extends EventEmitter {
  // 通訊協定
  constructor (peer) {
    super()
    let myName = peer.myName

    peer.on('close', () => {
      this.emit('close')
    })
    peer.on('data', json => {
      try {
        let { myName, type, data } = JSON.parse(json)
        // console.log('receive', type)
        this.emit(type, data, myName)
      } catch (e) {
        console.error('data parse error', e)
      }
    })

    this._peer = peer
    this.myName = myName
    this.otherName = peer.otherName
  }

  // local to remote
  send (messageType, data = {}) {
    let { _peer, myName } = this
    let str = JSON.stringify({
      myName,
      type: messageType,
      data
    })
    // console.log('send', messageType)
    _peer.send(str)
  }

  off (...args) {
    this.removeListener(...args)
  }
}

export default CustomPeer
