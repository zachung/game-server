class Lobby {
  constructor(io) {
    this.isOn = false;
    this.games = new Map();
    this.users = [];
    this.io = io;
  }
  addUser(socket) {
    this.users.push(socket.id);
  }
  get playerCount() {
    let count = {};
    this.games.forEach((games, gameName) => {
      count[gameName] = games[0].userCount;
    });
    return count;
  }
  /**
   * find first game or create
   *
   * @param      {socket}  socket  The socket
   * @return     {Game}  instance of Game
   */
  findGame(socket, gameClass) {
    let nsp = socket.nsp.name;
    if (!this.games.has(nsp)) {
      this.games.set(nsp, []);
    }
    let games = this.games.get(nsp);
    if (games.length === 0) {
      var game = new gameClass(socket);
      games.push(game);
    }
    return games[0];
  }
  on(gameClass) {
    let ioOfGame = this.io.of(gameClass.nsp);
    ioOfGame.on("connection", socket => {
      console.log('new socket in');
      this.addUser(socket);
      var game = this.findGame(socket, gameClass);
      if (!game.isRunning()) {
        game.start(ioOfGame);
      }
      socket.on("disconnect", reason => {
        var id = socket.id;
        console.log('user ' + id + ' disconnect', reason);
        game.removeUser(socket);

        this.io.of("/lobby").emit('user leave', socket.nsp.name);
      });
      game.addUser(socket);

      this.io.of("/lobby").emit('user count', this.playerCount);
    });
    this.isOn = true;

    var time_pre = new Date();
    this.interval = setInterval(() => {
      var now = new Date();
      var dt = now.getTime() - time_pre.getTime();
      time_pre = now;
      Object.entries(this.games).forEach(entry => {
        let gameName = entry[0];
        let games = entry[1];
        for (var i = games.length - 1; i >= 0; i--) {
          if (!games[i].isRunning()) {
            games.splice(i, 1);
            console.log([gameName, " #", i, " been killed."].join(""));
          }
        }
      })
    }, 10);
    console.log('lobby on');
  }
  off() {
    clearInterval(this.interval);
  }
}

module.exports = Lobby;