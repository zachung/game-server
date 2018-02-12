"use strict";

const express = require('express')
const WizardBattle = require('./WizardBattle')

module.exports = function(lobby) {
  var router = express.Router()

  router.get('/', function(req, res) {
    res.sendFile(__dirname + '/public/index.html');
  });

  // 靜態檔案
  router.use('/', express.static(__dirname + '/public'));

  lobby.on(WizardBattle);

  return router;
}