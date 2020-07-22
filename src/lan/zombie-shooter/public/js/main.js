var app = new PLAYGROUND.Application({

  paths: {
    images: 'zombie-shooter/images/',
    atlases: 'zombie-shooter/atlases/',
    data: 'zombie-shooter/data/',
    rewriteURL: {
      background: '/images/background.png'
    }
  },

  // preferedAudioFormat: "mp3",

  create: function () {
    this.loadSounds('music')
    this.loadImage([
      '<background>',
      'items/health',
      'items/run_speed_up',
      'items/weapon_speed_up',
      'items/bomb'
    ])
    this.loadData('levels')
    this.loadImage('zombie')
  },

  ready: function () {
    this.setState(ENGINE.Game)
  },

  mousedown: function (data) {
  },

  scale: 0.5
  // container: exampleContainer

})
