import Engine from './Engine'

new PLAYGROUND.Application({

  paths: {
    sounds: '/sounds/',
    rewriteURL: {
      background: '/images/background.png',
      zombie: '/images/zombie.png'
    }
  },

  create: function () {
    this.loadSounds('music')
    this.loadImage(['<background>', '<zombie>'])
    this.loadData('levels')
  },

  ready: function () {
    this.setState(Engine.Intro)
  },

  mousedown: function (data) {
  },

  scale: 0.5
  // container: exampleContainer

})
