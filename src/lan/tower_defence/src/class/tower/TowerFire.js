const Tower = require('./Tower')
const FireBolt = require('./FireBolt')

const upgradeOptions = [{
  name: "level 1",
  cost: 10,
  attrs: [{
    type: Tower.DAMAGE,
    value: 10
  },{
    type: Tower.COLDDOWN,
    value: -0.1
  }]
}, {
  name: "level 2",
  cost: 30,
  attrs: [{
    type: Tower.DAMAGE,
    value: 30
  },{
    type: Tower.COLDDOWN,
    value: -0.1
  }]
}, {
  name: "level 3",
  cost: 200,
  attrs: [{
    type: Tower.DAMAGE,
    value: 100
  },{
    type: Tower.COLDDOWN,
    value: -0.2
  }]
}];

class TowerFire extends Tower {
  constructor(options) {
    const defaults = {
      image: "dc-dngn/altars/dngn_altar_makhleb_flame1",
      damage: 10,
      attackDistance: 300,
      colddown: 1
    };
    const populated = Object.assign(defaults, options);
    super(populated);
  }
  isColddown(dt) {
    return this.lifetime - this.preAttackTime >= this.colddown;
  }
  get cost() {
    return 10;
  }
  get sellIncome() {
    return 10;
  }
  get projectileClass() {
    return FireBolt;
  }
  get upgradeOptions() {
    return upgradeOptions.slice(this.level);
  }
}

module.exports = TowerFire;