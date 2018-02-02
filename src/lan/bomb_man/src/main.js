const ENGINE = require('./engine')

var app = new PLAYGROUND.Application({

  paths: {
    images: "bomb-man/images/",
    sounds: "bomb-man/sounds/",
    atlases: "bomb-man/atlases/",
    data: "bomb-man/data/",
  },

  // preferedAudioFormat: "mp3",

  create: function() {

    this.loadSounds("music", "explosion")
    this.loadImage([
      "background",
      "items/Icon_blastup",
      "items/Icon_countup",
      "items/Icon_healthup",
      "items/Icon_speedup",
      "items/bomb",
      "items/fire",
      ]);
    this.loadData("levels");
    this.loadImage("zombie");

  },

  ready: function() {

    this.setState(ENGINE.Game);

  },

  mousedown: function(data) {
  },

  scale: 0.5,
  // container: exampleContainer

});