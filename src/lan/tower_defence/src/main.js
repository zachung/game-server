const ENGINE = require('./engine')

var app = new PLAYGROUND.Application({

  paths: {
    images: "tower-defence/images/",
    atlases: "tower-defence/atlases/",
    rewriteURL: {
      background: "/images/background.png"
    }
  },

  // preferedAudioFormat: "mp3",

  create: function() {

    this.loadSounds("music")
    this.loadImage([
      "<background>",
      "fire_bolt",
      "effect/bolt03",
      // floor
      "dc-dngn/floor/grass/grass1",
      "dc-dngn/floor/grass/grass_full",
      "dc-dngn/gateways/dngn_portal",
      "dc-dngn/dngn_trap_teleport",
      "dc-dngn/water/dngn_shoals_shallow_water1",
      // tower
      "dc-dngn/altars/dngn_altar_makhleb_flame1",
      "dc-dngn/altars/dngn_altar_sif_muna",
      "fire_bolt",
      "cursor",
      ]);
    this.loadAtlases(["sorlosheet", "sorlosheet_super"]);

  },

  ready: function() {

    this.setState(ENGINE.Game);

  },

  mousedown: function(data) {
  },

  scale: 0.5,
  // container: exampleContainer

});