const Ball = require('./ball')
const Floor = require('./Floor')
const TowerFire = require('./tower/TowerFire')
const TowerIce = require('./tower/TowerIce')
const Enemy = require('./enemy')
const TowerUI = require('../gui/TowerUI')

const Guid = require('../../../../library/Guid')
const Vector = require('../../../../library/Vector')
const CollisionDetection = require('../../../../library/CollisionDetection')
const Clazzes = {
  "TowerFire": TowerFire,
  "TowerIce": TowerIce,
  "Enemy": Enemy,
  "Floor": Floor,
}

var towerUI = new TowerUI();

class GameMap extends Ball {
  constructor(options) {
    const defaults = {
      x: 0,
      y: 0,
      map: [],
      tower: {},
      projectile: {},
      objects: {
        "Enemy": {},
      }
    };
    const populated = Object.assign(defaults, options);
    super(populated);
    for (let i in this.map) {
      for (let j in this.map[i]) {
        this.setMap(this.map[i][j], i, j);
      }
    }
    for (let [clazz, objects] of Object.entries(this.objects)) {
      for (let [id, object] of Object.entries(objects)) {
        this.objects[clazz][id] = new Clazzes[object.class](object);
        this.addObject(this.objects[clazz][id]);
      }
    }
  }
  get pointOfStart() {
    return this.levelData.enemy_path[0];
  }
  get pointOfEnd() {
    return this.levelData.enemy_path[this.levelData.enemy_path.length - 1];
  }
  init(data) {
    this.levelData = data;
    data.map.forEach((e, i) => {
      e.forEach((mapCode, j) => {
        this.setMap(mapCode, i, j);
      })
    })
  }
  setMap(mapCode, i, j) {
    if (!this.map[i]) {
      this.map[i] = [];
    }
    this.map[i][j] = new Floor({
      mapCode: mapCode,
      width: 64,
      height: 64,
      x: i*64,
      y: j*64,
    });
  }
  step(dt) {
    if (!this.isRunning) {
      return;
    }
    super.step(dt);
    Object.values(this.tower).forEach(tower => {
      tower.step(dt);
    });
    Object.values(this.projectile).forEach(projectile => {
      projectile.step(dt);
    });
    Object.values(this.objects).forEach(clazzes => {
      Object.values(clazzes).forEach(object => object.step(dt));
    });
  }
  render(app, deltaPoint = { x: 0, y: 0 }) {
    var hpX = app.width - 250;
    var hpDy = 20;
    var hpH = 30;
    var hpHInit = 20;
    var hpHCurrent = hpHInit + hpH + hpDy;

    for (let i in this.map) {
      for (let j in this.map[i]) {
        this.map[i][j].render(app, deltaPoint);
      }
    }

    for (const tower of Object.values(this.tower)) {
      tower.render(app, deltaPoint);
    }

    for (const projectile of Object.values(this.projectile)) {
      projectile.render(app, deltaPoint);
    }

    for (const clazzes of Object.values(this.objects)) {
      for (const object of Object.values(clazzes)) {
        object.render(app, deltaPoint);
      }
    }

    for (const clazzes of Object.values(this.objects)) {
      for (const object of Object.values(clazzes)) {
        // render user hp bar
        if (object instanceof Enemy) {
          let
            hpX = object.x + deltaPoint.x,
            hpY = object.y - 20 + deltaPoint.y,
            hpW = 50,
            hpH = 10;
          app.layer
            .fillStyle("#000")
            .fillRect(hpX, hpY, hpW, hpH)
            .fillStyle("#F00")
            .fillRect(hpX, hpY, hpW * (object.hp / object.hpMax), hpH);
        }
      }
    }

    towerUI.render(app, deltaPoint);
  }
  /** collision with other tower & road */
  tryBuildTower(tower) {
    // clear towerUI
    towerUI.inactive();
    // collision with other tower
    for (const other of Object.values(this.tower)) {
      let distance = CollisionDetection.RectRectDistance(tower, other);
      if (distance <= 0) {
        return false;
      }
    }
    let canBuildOn = true;
    for (let i in this.map) {
      for (let j in this.map[i]) {
        let other = this.map[i][j];
        let distance = CollisionDetection.RectRectDistance(tower, other);
        if (distance <= 0) {
          canBuildOn &= other.canBuildOn(this.tower);
        }
      }
    }
    return canBuildOn;
  }
  addTower(tower) {
    if (!this.tryBuildTower(tower)) {
      return false;
    }
    tower.on('step', (dt) => {
      this.attackInRange(tower, dt);
    }).on('attack', (other, dt) => {
      let projectile = tower.throwObject;
      projectile.goto(other);
      projectile.on('atEndPoint', () => {
        this.attackOnTouch(tower, projectile);
        delete this.projectile[projectile.id];
      });
      this.addProjectile(projectile);
    });
    this.tower[tower.id] = tower;
    return true;
  }
  removeTower(tower) {
    delete this.tower[tower.id];
  }
  addProjectile(projectile) {
    this.projectile[projectile.id] = projectile;
  }
  addObject(object) {
    let instance = this.getObject(object);
    if (instance) {
      // in map
      this.remove(object);
    }
    this.objects[object.class][object.id] = object;
    object.on('die', () => {
      this.remove(object);
    });
  }
  getObject(object) {
    return this.objects[object.class][object.id];
  }
  // remove object
  remove(object) {
    delete this.objects[object.class][object.id];
  }
  magicAttack(object) {
    var center = object.center;
    var fire = new Fire({
      id: Guid.gen('fire'),
      x: object.x,
      y: center.y,
      accelerate: Vector.fromRadians(object.directRadians, 10)
    });
    this.addObject(fire);
    fire.on('step', () => {
      this.attackOnTouch(object, fire);
    });
    return fire;
  }
  attackInRange(tower, dt) {
    for (const clazzes of Object.values(this.objects)) {
      for (const object of Object.values(clazzes)) {
        if (object instanceof Enemy) {
          tower.attack(object, dt);
        }
      }
    }
  }
  attackOnTouch(attacker, weapon) {
    for (const clazzes of Object.values(this.objects)) {
      for (const object of Object.values(clazzes)) {
        if (object === attacker) {
          continue;
        }
        weapon.attack(object);
        if (!weapon.isAlive()) {
          return;
        }
      }
    }
  }
  attackRange(attacker) {
    for (const clazzes of Object.values(this.objects)) {
      for (const object of Object.values(clazzes)) {
        attacker.attack(object);
      }
    }
  }
  setDifficulty(difficulty) {
    this.difficulty = difficulty;
  }
  roundStart() {
    if (this.isRunning) {
      return;
    }
    this.isRunning = true;
    let gamemap = this;
    let enemy_count = 10;
    this.timer = setInterval(() => {
      if (enemy_count > 0) {
        let
          hp = 11 - enemy_count + (this.difficulty - 1)*100, // from 10s to 5s
          enemy = new Enemy({
            id: Guid.gen('enemy'),
            x: this.pointOfStart.x,
            y: this.pointOfStart.y,
            hp: hp,
            hpMax: hp
          });
        enemy.on('die', () => {
          gamemap.trigger('enemyDie', enemy);
        }).on('atEndPoint', () => {
          // minus score
          gamemap.trigger('enemyEscape', enemy);
        }).setPath(this.levelData.enemy_path);
        this.addObject(enemy);

        enemy_count--;
      } else {
        if (Object.keys(this.objects["Enemy"]).length === 0) {
          clearInterval(this.timer);
          this.isRunning = false;
          gamemap.trigger('roundEnd');
        } else {
          console.log("monster running count: ", Object.keys(this.objects["Enemy"]).length);
        }
      }
    }, 1000);
  }
  gameOver() {
    clearInterval(this.timer);
    this.isRunning = false;
    this.trigger('gameOver');
  }

  showTowerArea(isShow) {
    Object.values(this.tower).forEach(tower => {
      tower.isShowArea = isShow;
    });
  }

  onMousedown(...args) {
    args.unshift('mousedown');
    let propagation;
    propagation = towerUI.trigger.apply(towerUI, args);
    if (false === propagation) {
      return false;
    }

    towerUI.inactive();
    let towers = Object.values(this.tower);
    propagation = towers.forEach(object => {
      let propagation = object.trigger.apply(object, args);
      if (object.isShowArea) {
        towerUI.active(object);
      }
      return !propagation;
    });
    return !propagation;
  }
}

module.exports = GameMap;