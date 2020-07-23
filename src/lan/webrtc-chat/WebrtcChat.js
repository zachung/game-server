const Game = require('../../library/Lobby')

class WebrtcChat extends Game {
  static get nsp () {
    return '/webrtc-chat'
  }
  onStart (io) {
    super.onStart(io)
    require('./src/server').register(io)
  }
}

module.exports = WebrtcChat
