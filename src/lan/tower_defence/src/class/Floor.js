const Graphic = require('./Graphic')

class Floor extends Graphic {
  constructor(options) {
    const defaults = {
      width: 32,
      height: 32,
    };
    const populated = Object.assign(defaults, options);
    super(populated);
  }
  render() {
    switch (this.mapCode) {
      case 0:
        this.image = "dc-dngn/gateways/dngn_portal";
        break;
      case 1:
        this.image = "dc-dngn/floor/grass/grass1";
        break;
      case 2:
        this.image = "dc-dngn/floor/grass/grass_full";
        break;
      case 8:
        this.image = "dc-dngn/water/dngn_shoals_shallow_water1";
        break;
      case 9:
        this.image = "dc-dngn/dngn_trap_teleport";
        break;
    }
    super.renderImage.apply(this, arguments);
  }
  canBuildOn() {
    switch (this.mapCode) {
      case 1:
        return true;
      default:
        return false;
    }
  }
}

module.exports = Floor;