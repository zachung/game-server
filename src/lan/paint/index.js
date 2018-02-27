const express = require('express')

module.exports = function() {
  var router = express.Router()

  router.get('/', function(req, res) {
    res.sendFile(__dirname + '/public/index.html');
  });

  // 靜態檔案
  router.use('/', express.static(__dirname + '/public'));

  return router;
}