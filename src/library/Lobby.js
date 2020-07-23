class Lobby {
  constructor () {
    this.isStart = false
    this.users = new Map()
  }
  static get nsp () {
    return '/lobby'
  }
  addUser (socket) {
    var address = socket.handshake.address
    console.log('user ' + address + ' connected')

    this.users.set(socket.id, address)
    // socket.join("lobby");
    socket.broadcast.emit('user list', this.users)
  }
  removeUser (socket) {
    let id = socket.id
    console.log('user ' + id + ' been removed')
    this.users.delete(id)
  }
  get userCount () {
    return this.users.size
  }
  isRunning () {
    return this.isStart
  }
  step (dt) {
    this.gameTime += dt
    // all user leave
    if (this.users.size === 0) {
      console.log('all user leave')
      this.stop()
    }
  }
  onStart (io) {
    console.log('lobby on')
  }
  start (io) {
    if (this.isStart) {
      return
    }
    this.isStart = true
    let time_pre = new Date()
    const game = this
    game.onStart(io)
    this.interval = setInterval(function () {
      const now = new Date()
      const dt = now.getTime() - time_pre.getTime()
      game.step(dt / 1000)
      time_pre = now
    }, 10)
  }
  stop () {
    console.log('game stop')
    clearInterval(this.interval)
    this.isStart = false
  }
}

module.exports = Lobby
