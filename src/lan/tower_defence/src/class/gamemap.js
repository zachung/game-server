const Ball = require('./ball')
const Floor = require('./Floor')
const TowerFire = require('./tower/TowerFire')
const TowerIce = require('./tower/TowerIce')
const Enemy = require('./enemy')
const TowerUI = require('../gui/TowerUI')
const Group = require('./Group')

const Guid = require('../../../../library/Guid')
const Vector = require('../../../../library/Vector')
const CollisionDetection = require('../../../../library/CollisionDetection')

class GameMap extends Ball {
  constructor(options) {
    const defaults = {
      x: 0,
      y: 0,
      map: new Group(),
      tower: new Group(),
      projectile: new Group(),
      objects: new Group(),
      towerUI: new TowerUI()
    };
    const populated = Object.assign(defaults, options);
    super(populated);
    this.group = new Group();
    this.group.add(this.map);
    this.group.add(this.tower);
    this.group.add(this.projectile);
    this.group.add(this.objects);
    this.group.add(this.towerUI);
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
        this.map.add(new Floor({
          mapCode: mapCode,
          width: 64,
          height: 64,
          x: i*64,
          y: j*64,
        }));
      })
    })
  }
  step(dt) {
    if (!this.isRunning) {
      this.projectile.step(dt);
      return;
    }
    super.step(dt);
    this.group.step(dt);
  }
  render(app, deltaPoint = { x: 0, y: 0 }) {
    var hpX = app.width - 250;
    var hpDy = 20;
    var hpH = 30;
    var hpHInit = 20;
    var hpHCurrent = hpHInit + hpH + hpDy;

    this.group.x = deltaPoint.x;
    this.group.y = deltaPoint.y;
    this.group.render(app);
  }
  /** collision with other tower & road */
  tryBuildTower(tower) {
    // clear towerUI
    this.towerUI.inactive();
    // collision with other tower
    for (const other of Object.values(this.tower.set)) {
      let distance = CollisionDetection.RectRectDistance(tower, other);
      if (distance <= 0) {
        return false;
      }
    }
    let collisionWithOtherTower = this.tower.some(other => {
      return CollisionDetection.RectRectDistance(tower, other) <= 0;
    });
    if (collisionWithOtherTower) {
      return false;
    }
    let canBuildOn = true;
    let inMap = false;
    this.map.forEach(map => {
      let distance = CollisionDetection.RectRectDistance(tower, map);
      if (distance <= 0) {
        inMap = true;
        canBuildOn &= map.canBuildOn();
      }
    });
    return inMap && canBuildOn;
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
        this.projectile.delete(projectile);
      });
      this.addProjectile(projectile);
    });
    this.tower.add(tower);
    return true;
  }
  removeTower(tower) {
    this.tower.delete(tower);
  }
  addProjectile(projectile) {
    this.projectile.add(projectile);
  }
  addObject(object) {
    if (this.objects.has(object)) {
      this.objects.delete(object);
    }
    this.objects.add(object);
    object.on('die', () => {
      this.objects.delete(object);
    });
  }
  // remove object
  remove(object) {
    this.objects.delete(object);
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
    this.objects.forEach(object => {
      if (object instanceof Enemy) {
        tower.attack(object, dt);
      }
    });
  }
  attackOnTouch(attacker, weapon) {
    this.objects.some(object => {
      if (object === attacker) {
        return false;
      }
      weapon.attack(object);
      if (!weapon.isAlive()) {
        return true;
      }
      return false;
    });
  }
  attackRange(attacker) {
    this.objects.forEach(object => attacker.attack(object));
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
        if (this.objects.size === 0) {
          clearInterval(this.timer);
          this.isRunning = false;
          gamemap.trigger('roundEnd');
        } else {
          console.log("monster running count: ", this.objects.size);
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
    this.tower.forEach(tower => {
      tower.isShowArea = isShow;
    });
  }

  onMousedown(...args) {
    args.unshift('mousedown');
    let propagation;
    propagation = this.towerUI.trigger.apply(this.towerUI, args);
    if (false === propagation) {
      return false;
    }

    this.towerUI.inactive();
    propagation = this.tower.forEach(object => {
      let propagation = object.trigger.apply(object, args);
      if (object.isShowArea) {
        this.towerUI.active(object);
      }
      return !propagation;
    });
    return !propagation;
  }
}

module.exports = GameMap;