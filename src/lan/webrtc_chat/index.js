const express = require('express')
const WebrtcChat = require('./WebrtcChat')

module.exports = function (lobby) {
  var router = express.Router()

  router.get('/', function (req, res) {
    res.sendFile([__dirname, '/public/index.html'].join(''))
  })

  // 靜態檔案
  router.use('/', express.static([__dirname, '/public'].join('')))

  lobby.on(WebrtcChat)

  return router
}
