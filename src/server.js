const path = require('path')
const express = require('express')
const app = express()
const http = require('http').Server(app)
const io = require('socket.io')(http)
const Engine = require('./library/Engine')
const Lobby = require('./library/Lobby')

const engine = new Engine(io)

app.use('/', (function () {
  const router = express.Router()

  // 靜態檔案
  router.use('/', express.static(path.join(__dirname, '/../public')))

  engine.on(Lobby)

  return router
}()))

app.use('/', require('./routes')(engine))

app.use(function (err, req, res, next) {
  console.error(err.stack)
  res.status(500).send('Something broke!')
})

http.listen(8080, function () {
  console.log('listening on *:8080')
})
