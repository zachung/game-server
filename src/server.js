var path = require('path')
var express = require('express')
var app = express()
var http = require('http').Server(app)
var fs = require('fs')
var io = require('socket.io')(http)
const Lobby = require('./library/Lobby')
const Game = require('./library/Game')

var lobby = new Lobby(io)

app.use('/', (function () {
  var router = express.Router()

  // static games
  const single = './src/single/'
  fs.readdir(single, (err, files) => {
    if (err) {
      return
    }
    files.forEach(gameName => {
      router.use('/' + gameName, express.static(path.join(single, gameName, '/public')))
    })
  })

  // 靜態檔案
  router.use('/', express.static(path.join(__dirname, '/../public')))

  lobby.on(Game)

  return router
}()));

// multi
[{
  name: 'zombie-shooter',
  index: 'zombie_shooter/index'
},
{
  name: 'bomb-man',
  index: 'bomb_man/index'
},
{
  name: 'wizard-battle',
  index: 'wizard_battle/index'
},
{
  name: 'tower-defence',
  index: 'tower_defence/index'
},
{
  name: 'webrtc-chat',
  index: 'webrtc_chat/index'
}
].forEach(game => {
  const name = '/' + game.name
  const index = './lan/' + game.index
  app.use(name, require(index)(lobby))
})

app.use(function (err, req, res, next) {
  console.error(err.stack)
  res.status(500).send('Something broke!')
})

http.listen(8080, function () {
  console.log('listening on *:8080')
})
