const ENGINE = require('./engine')

var app = new PLAYGROUND.Application({

  paths: {
    images: 'wizard-battle/images/',
    atlases: 'wizard-battle/atlases/',
    rewriteURL: {
      background: '/images/background.png'
    }
  },

  // preferedAudioFormat: "mp3",

  create: function () {
    this.loadSounds('music', 'explosion')
    this.loadImage([
      '<background>',
      'fire_bolt'
    ])
    this.loadAtlases('sorlosheet')
  },

  ready: function () {
    this.setState(ENGINE.Game)
  },

  mousedown: function (data) {
  },

  scale: 0.5
  // container: exampleContainer

})
