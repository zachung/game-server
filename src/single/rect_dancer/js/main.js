var app = new PLAYGROUND.Application({

  paths: {
    sounds: '/sounds/',
    rewriteURL: {
      background: '/images/background.png'
    }
  },

  create: function () {
    this.loadSounds('music')
    this.loadImage('<background>')
  },

  ready: function () {
    this.setState(ENGINE.Intro)
  },

  mousedown: function (data) {
  },

  scale: 0.5
  // container: exampleContainer

})
