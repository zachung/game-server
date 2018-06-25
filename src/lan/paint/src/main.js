const ENGINE = require('./engine')

var app = new PLAYGROUND.Application({

  create: function () {
  },

  ready: function () {
    this.setState(ENGINE.Game)
  },

  mousedown: function (data) {
  },

  scale: 0.5
  // container: exampleContainer

})
