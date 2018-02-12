"use strict";

const express = require('express')
const TowerDefence = require('./TowerDefence')

module.exports = function(lobby) {
  var router = express.Router()

  router.get('/', function(req, res) {
    res.sendFile(__dirname + '/public/index.html');
  });

  // 靜態檔案
  router.use('/', express.static(__dirname + '/public'));

  lobby.on(TowerDefence);

  return router;
}