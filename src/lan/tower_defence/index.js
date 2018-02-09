const express = require('express')
const Lobby = require('../../library/Lobby')
const TowerDefence = require('./TowerDefence')

module.exports = function(io) {
  var router = express.Router()

  router.get('/', function(req, res) {
    res.sendFile(__dirname + '/public/index.html');
  });

  // 靜態檔案
  router.use('/', express.static(__dirname + '/public'));

  var lobby = new Lobby(TowerDefence);
  lobby.on(io);

  return router;
}