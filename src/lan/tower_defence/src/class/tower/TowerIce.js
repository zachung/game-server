const Tower = require('./Tower')
const IceBolt = require('./IceBolt')

const upgradeOptions = [{
  name: "level 1",
  cost: 30,
  attrs: [{
    type: Tower.RADIUS,
    value: 50
  }, {
    type: Tower.DAMAGE,
    value: 5
  }]
}, {
  name: "level 2",
  cost: 30,
  attrs: [{
    type: Tower.RADIUS,
    value: 50
  }, {
    type: Tower.DAMAGE,
    value: 5
  }]
}, {
  name: "level 3",
  cost: 30,
  attrs: [{
    type: Tower.COLDDOWN,
    value: -0.2
  }]
}, {
  name: "level 4",
  cost: 100,
  attrs: [{
    type: Tower.RADIUS,
    value: 200
  }, {
    type: Tower.COLDDOWN,
    value: -0.1
  }, {
    type: Tower.DAMAGE,
    value: -10
  }]
}];

class TowerIce extends Tower {
  constructor(options) {
    const defaults = {
      image: "dc-dngn/altars/dngn_altar_sif_muna",
      damage: 5,
      attackDistance: 100,
      colddown: 0.3
    };
    const populated = Object.assign(defaults, options);
    super(populated);
  }
  isColddown(dt) {
    return this.lifetime % this.colddown <= dt;
  }
  get cost() {
    return 50;
  }
  get sellIncome() {
    return 50;
  }
  get projectileClass() {
    return IceBolt;
  }
  get upgradeOptions() {
    return upgradeOptions.slice(this.level);
  }
}

module.exports = TowerIce;