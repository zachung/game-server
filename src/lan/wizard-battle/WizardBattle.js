const Game = require('../../library/Lobby')
const Thomas = require('./src/class/thomas')
const GameMap = require('./src/class/gamemap')

const SocketEvent = {
  disconnect (socket, user) {
    var id = user.id
    console.log('user ' + id + ' disconnect')
    this.removeUser(user)
  },
  user_move (socket, user, direct) {
    user.setFaceDirectBits(direct)
  },
  user_move_not (socket, user, direct) {
    user.cancelFaceDirectBits(direct)
  },
  magic_attack (socket, user, clientUser) {
    user.directRadians = clientUser.directRadians
    user.magicAttack(this.gameMap)
    socket.broadcast.emit('magic_attack', user)
  }
}

const users = new Map()

class WizardBattle extends Game {
  static get nsp () {
    return '/wizard-battle'
  }
  addUser (socket) {
    super.addUser(socket)
    var game = this
    var id = socket.id
    var user = new Thomas({
      id: id,
      color: '#' + (Math.random().toString(16) + '000000').slice(2, 8)
    })

    user.on('die', function () {
      console.log('user die')
      socket.broadcast.emit('user_die', user)
      socket.emit('user_die', user)
      setTimeout(() => {
        user.cancelFaceDirectBits(0b0000)
        console.log('respawn user', user.id)
        game.gameMap.addUser(user)
      }, 1000)
    })
    user.on('step', function (dt) {
      // user location
      socket.broadcast.emit('user_location', user)
      socket.emit('user_location', user)
    })
    game.gameMap.addUser(user)
    socket.broadcast.emit('user_location', user)
    socket.emit('set_map', this.gameMap)

    for (const key in SocketEvent) {
      if (SocketEvent.hasOwnProperty(key)) {
        socket.on(key, function () {
          var args = Array.from(arguments)
          args.unshift(user)
          args.unshift(socket)
          SocketEvent[key].apply(game, args)
        })
      }
    }
    users.set(id, user)
  }
  step (dt) {
    super.step(dt)
    this.gameMap.step(dt)
  }
  removeUser (socket) {
    super.removeUser(socket)
    let id = socket.id
    if (!users.has(id)) {
      return
    }
    this.gameMap.remove(users.get(id))
    users.delete(id)
  }
  onStart (io) {
    super.onStart(io)
    this.gameMap = new GameMap()
    this.gameMap.init()
  }
}

module.exports = WizardBattle
