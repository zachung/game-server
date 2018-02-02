class Lobby {
  constructor(Game) {
    this.isOn = false;
    this.games = {};
    this.users = [];
    this.gameClass = Game;
  }
  addUser(socket) {
    this.users.push(socket.id);
  }
  /**
   * find first game or create
   *
   * @param      {socket}  socket  The socket
   * @return     {Game}  instance of Game
   */
  findGame(socket) {
    var game_ids = Object.keys(this.games);
    if (game_ids.length === 0) {
      var game = new this.gameClass(socket);
      this.games[socket.id] = game;
      return game;
    }
    return this.games[game_ids[0]];
  }
  on(io) {
    if (this.isOn) {
      return;
    }
    var lobby = this;
    io.on("connection", function(socket) {
      console.log('new socket in');
      lobby.addUser(socket);
      var game = lobby.findGame(socket);
      if (!game.isRunning()) {
        game.start(io);
      }
      game.addUser(socket);
    });
    this.isOn = true;

    var time_pre = new Date();
    this.interval = setInterval(function() {
      var now = new Date();
      var dt = now.getTime() - time_pre.getTime();
      time_pre = now;
      Object.keys(lobby.games).map(function(key) {
        if (!lobby.games[key].isRunning()) {
          delete lobby.games[key];
          console.log('game ' + key + ' been killed.');
        }
      });
    }, 10);
    console.log('lobby on');
  }
  off() {
    clearInterval(this.interval);
  }
}

module.exports = Lobby;