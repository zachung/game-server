const express = require('express')

module.exports = function(app, io) {
  var router = express.Router()

  router.use(function(req, res, next) {
    next();
  })

  router.get('/', function(req, res) {
    res.sendFile(__dirname + '/index.html');
  });

  // 靜態檔案
  router.use('/', express.static(__dirname + '/public'));

  var Lobby = require('./lobby');
  var lobby = new Lobby();
  lobby.on(io);

  return router;
}