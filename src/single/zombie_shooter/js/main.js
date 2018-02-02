var app = new PLAYGROUND.Application({

  // preferedAudioFormat: "mp3",

  create: function() {

    this.loadSounds("music")
    this.loadImage("background");
    this.loadData("levels");
    this.loadImage("zombie");

  },

  ready: function() {

    this.setState(ENGINE.Intro);

  },

  mousedown: function(data) {
  },

  scale: 0.5,
  // container: exampleContainer

});