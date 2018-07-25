class Room {
  constructor () {
    this.peers = []
    this.handlers = []
  }

  subscribe (fn) {
    this.handlers.push(fn)
  }

  add (peer) {
    peer.on('close', () => {
      this.remove(peer)
    })
    peer.on('message', msg => {
      console.log('got message', msg)
    })
    this.peers.push(peer)
    this._observer()
  }

  remove (peer) {
    let peers = this.peers
    let inx = peers.indexOf(peer)
    if (inx !== -1) {
      peers.splice(inx, 1)
      this._observer()
    }
  }

  send (msg) {
    this.peers.forEach(peer => {
      peer.send('message', msg)
    })
  }

  _observer () {
    this.handlers.forEach(handler => handler(this.peers))
  }
}

export default Room
