class Engine {
  constructor (io) {
    this.games = new Map()
    this.users = []
    this.io = io
  }

  addUser (socket) {
    this.users.push(socket.id)
  }

  get playerCount () {
    let count = {}
    this.games.forEach((games, gameName) => {
      if (games[0]) {
        count[gameName] = games[0].userCount
      }
    })
    return count
  }

  /**
   * find first game or create
   *
   * @param {socket}  socket  The socket
   * @param {Game} gameClass
   * @return {Game}  instance of Game
   */
  findGame (socket, gameClass) {
    let nsp = socket.nsp.name
    if (!this.games.has(nsp)) {
      this.games.set(nsp, [])
    }
    let games = this.games.get(nsp)
    if (games.length === 0) {
      const game = new gameClass(socket)
      games.push(game)
    }
    return games[0]
  }

  on (gameClass) {
    console.log('loading ' + gameClass.nsp + ' ...')
    let ioOfGame = this.io.of(gameClass.nsp)
    ioOfGame.on('connection', socket => {
      this.addUser(socket)
      const game = this.findGame(socket, gameClass)
      if (!game.isRunning()) {
        game.start(ioOfGame)
      }
      socket.on('disconnect', reason => {
        game.removeUser(socket, reason)
        this.io.of('/lobby').emit('user leave', socket.nsp.name)
      })
      game.addUser(socket)

      this.io.of('/lobby').emit('user count', this.playerCount)
    })

    this.interval = setInterval(() => {
      this.games.forEach((games, gameName) => {
        for (let i = games.length - 1; i >= 0; i--) {
          if (!games[i].isRunning()) {
            games.splice(i, 1)
            console.log([gameName, ' #', i, ' been killed.'].join(''))
          }
        }
      })
    }, 10)
  }

  off () {
    clearInterval(this.interval)
  }
}

module.exports = Engine
