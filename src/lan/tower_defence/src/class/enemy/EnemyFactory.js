const Guid = require('../../../../../library/Guid')
const EnemyTypes = [
  require('./Sorlosheet'),
  require('./SorlosheetSuper'),
];

class EnemyFactory {
  static newEnemy(options) {
    const defaults = {
      id: Guid.gen('enemy'),
      type: 0
    };
    options.hpMax = options.hp;
    const populated = Object.assign(defaults, options);

    let type = EnemyTypes[populated.type];
    return new type(options);
  }
}

module.exports = EnemyFactory;