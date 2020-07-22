const path = require('path')
const express = require('express')
const app = express()
const http = require('http').Server(app)
const fs = require('fs')
const io = require('socket.io')(http)
const Lobby = require('./library/Lobby')
const Game = require('./library/Game')

const lobby = new Lobby(io)

app.use('/', (function () {
  const router = express.Router()

  // 靜態檔案
  router.use('/', express.static(path.join(__dirname, '/../public')))

  lobby.on(Game)

  return router
}()))

// single
const single = './src/single/'
fs.readdir(single, (err, files) => {
  if (err) {
    return
  }
  files.forEach(gameName => {
    app.use('/' + gameName, express.static(path.join(single, gameName, 'public')))
  })
})

// multi
const lan = './src/lan/'
fs.readdir(lan, (err, files) => {
  if (err) {
    return
  }
  files.forEach(gameName => {
    const index = './lan/' + gameName + '/index'
    app.use('/' + gameName, require(index)(lobby))
  })
})

app.use(function (err, req, res, next) {
  console.error(err.stack)
  res.status(500).send('Something broke!')
})

http.listen(8080, function () {
  console.log('listening on *:8080')
})
