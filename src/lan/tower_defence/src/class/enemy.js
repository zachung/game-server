const Ball = require('./ball')
const EasingFunctions = require('../../../../library/EasingFunctions')
const Vector = require('../../../../library/Vector')

class Enemy extends Ball {
  constructor(options) {
    const defaults = {
      hp: 10,
      hpMax: 10,
      width: 72,
      height: 72,
      atlases: "sorlosheet",
      defence: 0,
      fireRadius: 100,
      bombCount: 0,
      bombCountMax: 10,
      defence: 1,
      mass: 0.5,
      friction: 0,
      nextPathIndex: 1,
      reward: 10,
      score: 1,
      escapeFine: 1
    };
    const populated = Object.assign(defaults, options);
    super(populated);
  }
  onStep(dt) {
    let
      from = Vector.fromObject(this.path[this.nextPathIndex - 1]),
      to = Vector.fromObject(this.path[this.nextPathIndex]);
    if (Vector.fromObject(this).subtract(from).length() > to.clone().subtract(from).length()) {
      this.nextPathIndex++;
      if (!this.path[this.nextPathIndex]) {
        this.trigger('atEndPoint', dt);
        return;
      }
    }
    // acceleration
    this.accelerate = to.clone().subtract(from);
    let length = this.accelerate.length();
    this.accelerate.multiply(new Vector(1/this.mass/length, 1/this.mass/length));

    super.onStep.apply(this, arguments);
  }
  spawnBomb(map) {
    if (this.bombCount >= this.bombCountMax) {
      return;
    }
    var user = this;
    var bomb = map.spawnBomb(this);
    bomb.on("die", function() {
      user.bombCount--;
    })
    this.bombCount++;
    return bomb;
  }
  render() {
    this.renderAtlas.apply(this, arguments);
  }
  renderAtlas(app, deltaPoint = { x: 0, y: 0 }) {
    let isFaceToLeft = Math.abs(this.directRadians) < Math.PI / 2;
    let x = this.x + deltaPoint.x + (isFaceToLeft ? 0 : this.width);
    let y = this.y + deltaPoint.y;

    super.renderBuff.apply(this, arguments);

    let length = this.accelerate.length();
    if (length < 1) {
      this.renderStand(app, x, y, isFaceToLeft);
    } else {
      this.renderRun(app, x, y, isFaceToLeft);
    }
    let
      hpX = this.x + deltaPoint.x,
      hpY = this.y - 20 + deltaPoint.y,
      hpW = 50,
      hpH = 10;
    app.layer
      .fillStyle("#000")
      .fillRect(hpX, hpY, hpW, hpH)
      .fillStyle("#F00")
      .fillRect(hpX, hpY, hpW * (this.hp / this.hpMax), hpH);
  }
  renderStand(app, x, y, isFaceToLeft) {
    let atlas = app.atlases[this.atlases];
    // 0, 1, 2
    let current = ((app.lifetime * 4) % 2 / 2) * 3 | 0;

    app.layer
      .save()
      .setTransform(1, 0, 0, 1, x, y)
      .scale(isFaceToLeft ? 1 : -1, 1)
      .drawAtlasFrame(atlas, current, 0, 0)
      .restore();
  }
  renderRun(app, x, y, isFaceToLeft) {
    let atlas = app.atlases[this.atlases];
    // 3, 4, 5, 6
    let current = ((app.lifetime * 4) % 2 / 2) * 4 | 0;
    current += 3;

    app.layer
      .save()
      .setTransform(1, 0, 0, 1, x, y)
      .scale(isFaceToLeft ? 1 : -1, 1)
      .drawAtlasFrame(atlas, current, 0, 0)
      .restore();
  }
  setPath(path) {
    this.path = path;
  }
}

module.exports = Enemy;