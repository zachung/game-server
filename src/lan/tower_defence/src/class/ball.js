const Graphic = require('./Graphic')
const CollisionDetection = require('../../../../library/CollisionDetection')
const EasingFunctions = require('../../../../library/EasingFunctions')
const Vector = require('../../../../library/Vector')

class Ball extends Graphic {
  constructor(options) {
    const defaults = {
      directRadians: 0,
      hp: 1,
      hpMax: 1,
      damage: 0,
      defence: 0,
      attackDistance: 0,
      mass: 1,
      punchForce: 0,
      friction: 0,
      buffs: []
    };
    const populated = Object.assign(defaults, options);
    super(populated);
    this.clazz = this.constructor.name;

    if (this.accelerate) {
      this.accelerate = new Vector(this.accelerate.x, this.accelerate.y);
    } else {
      this.accelerate = new Vector();
    }
  }
  addBuff(buff) {
    if (this.buffs[buff.name]) {
      return;
    }
    buff.effect(this);
    this.buffs[buff.name] = buff;
  }
  removeBuff(buff) {
    delete this.buffs[buff.name];
  }
  onStep(dt) {
    Object.values(this.buffs).forEach(buff => buff.step(dt));
    // friction
    if (this.friction !== 0) {
      let friction = this.accelerate.clone().rotate(Math.PI).multiply(new Vector(this.friction, this.friction));
      this.accelerate.add(friction);
    }
    // dont move
    this.x += this.accelerate.x;
    this.y += this.accelerate.y;
  }
  renderBuff() {
    Object.values(this.buffs).forEach(buff => buff.render.apply(buff, arguments));
  }
  render() {
    this.renderBuff.apply(this, arguments);
    super.render.apply(this, arguments);
  }
  renderImage() {
    this.renderBuff.apply(this, arguments);
    super.renderImage.apply(this, arguments);
  }
  renderAtlas() {
    this.renderBuff.apply(this, arguments);
    super.renderAtlas.apply(this, arguments);
  }
  /**
   * Gets the damage.
   *
   * @param      {number}  damage  The damage
   * @return     {boolean}  still alive
   */
  getDamage(damage, dt) {
    this.hp -= Math.max(damage * dt - this.defence, 0);
    var isAlive = this.isAlive();
    if (!isAlive) {
      this.die();
    }
    return isAlive;
  }
  isAlive() {
    return this.hp > 0;
  }
  attack(other, dt = 1) {
    var isHitted = this.canAttack(other);
    if (isHitted) {
      other.getAttack(this, dt);
      this.getDamage(other.defence, dt);
    }
    return isHitted;
  }
  getAttack(other, dt) {
    let isAlive = this.getDamage(other.damage, dt);
    if (isAlive) {
      // punch
      other.punch(this);
    }
  }
  punch(other) {
    let angle = CollisionDetection.RectRectAngle(other, this);
    other.accelerate.add(
      Vector.fromRadians(angle, -this.punchForce)
    );
  }
  // can attack other
  canAttack(other) {
    if (this === other) {
      return false;
    }
    return CollisionDetection.RectRectDistance(this, other) <= this.attackDistance;
  }
  die() {
    this.trigger('die');
  }
}

module.exports = Ball;