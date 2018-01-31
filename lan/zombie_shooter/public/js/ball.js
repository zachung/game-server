class Ball {
  constructor(options) {
    const defaults = {
      x: 0,
      y: 0,
      width: 32,
      height: 32,
      color: "#e2543e",
      directRadians: 0,
      speed: 0,
      hp: 1,
      damage: 0,
      defence: 0
    };
    const populated = Object.assign(defaults, options);
    for (const key in populated) {
      if (populated.hasOwnProperty(key)) {
        this[key] = populated[key];
      }
    }
  }
  faceTo(x, y) {
    this.directRadians = Math.atan2(y - this.y, x - this.x);
  }
  step(dt) {
    this.x += Math.cos(this.directRadians) * this.speed * dt;
    this.y += Math.sin(this.directRadians) * this.speed * dt;
  }
  /**
   * Gets the damage.
   *
   * @param      {number}  damage  The damage
   * @return     {boolean}  still alive
   */
  getDamage(damage) {
    this.hp -= damage - this.defence;
    return this.hp > 0;
  }
  render(app, deltaPoint = {x:0, y:0}) {
    app.layer
      .fillStyle(this.color)
      .fillRect(this.x + deltaPoint.x, this.y + deltaPoint.y, this.width, this.height);
  }
  renderImage(app, deltaPoint = {x:0, y:0}) {
    app.layer.drawImage(app.images[this.image], this.x + deltaPoint.x, this.y + deltaPoint.y, this.width, this.height);
  }
  /**
   * Gets the damage.
   *
   * @param      {number}  damage  The damage
   * @return     {boolean}  still alive
   */
  getDamage(damage) {
    this.hp -= damage;
    return this.hp > 0;
  }
}

class Zombie extends Ball {
  constructor(options) {
    const defaults = {
      x: 0,
      y: 0,
      width: 128,
      height: 128,
      image: "zombie",
      speed: 256,
      directRadians: 0,
      hp: 1,
      damage: 1,
      defence: 0
    };
    const populated = Object.assign(defaults, options);
    super(populated);
    this.speed *= Math.random() * 0.8 + 0.2;
  }
  faceTo(x, y) {
    this.directRadians = Math.atan2(y - this.y, x - this.x);
  }
}

class Thomas extends Ball {
  constructor(options) {
    super(options);
    this.faceDirectBits = 0b0000; // LRUD
  }
  takeWeapon(weapon) {
    this.weapon = weapon;
  }
  attack(dt) {
    if (!this.weapon) {
      return;
    }
    this.weapon.attack(this.x, this.y, dt);
  }
  render(app, deltaPoint = {x:0, y:0}) {
    super.render(app, deltaPoint);
    // gun bullet
    if (this.weapon) {
      this.weapon.render(app, deltaPoint);
    }
  }
  getItem(item) {
    switch (item.type) {
      case Item.gunColddown:
        this.weapon.upgrade("colddown", item.value);
        break;
      case Item.runSpeedUp:
        this.speed = Math.min(this.speed + item.value, 1000);
        break;
      case Item.health:
        this.hp = Math.min(this.hpMax, this.hp + item.value);
        break;
    }
  }
  getMoveVector() {
    var x = 0, y = 0;
    x -= (this.faceDirectBits >> 3) & 1; // L
    x += (this.faceDirectBits >> 2) & 1; // R
    y -= (this.faceDirectBits >> 1) & 1; // U
    y += (this.faceDirectBits >> 0) & 1; // D
    return {x: x, y: y};
  }
  step(dt) {
    var vector = this.getMoveVector();
    this.directRadians = Math.atan2(vector.y, vector.x);
    // dont move
    if (vector.x === 0 && vector.y === 0) return;
    super.step(dt);
    if (this.weapon) {
      this.weapon.x = this.x;
      this.weapon.y = this.y;
    }
  }
}

class Item extends Ball {
  static get gunColddown() {
    return "gunColddown";
  }
  static get health() {
    return "health";
  }
  static get runSpeedUp() {
    return "runSpeedUp";
  }
}

class Bullet extends Ball {
  constructor(options) {
    const defaults = {
      x: 0,
      y: 0,
      width: 10,
      height: 10,
      color: "#ff0000",
      speed: 1024,
      directRadians: 0,
      damage: 5,
      hp: 1 // can go throw somebody
    };
    const populated = Object.assign(defaults, options);
    super(populated);
  }
}

class Gun extends Ball {
  constructor(options) {
    const defaults = {
      max_radius: 0,
      colddown: 0,
      nextshoot: 0,
      bullets: [],
      checkColliding(bullet) {}
    };
    const populated = Object.assign(defaults, options);
    super(populated);
    if (this.bullets.length !== 0) {
      this.bullets = this.bullets.map(bullet => new Bullet(bullet));
    }
  }
  attack(fromX, fromY, dt) {
    this.step(dt);
    if (this.nextshoot > 0) {
      this.nextshoot -= dt;
      return;
    }
    var bullets = this.bullets;
    var bullet = new Bullet({
      x: fromX,
      y: fromY,
      directRadians: this.directRadians
    });
    bullets.push(bullet);
    this.nextshoot = this.colddown;
    return bullet;
  }
  step(dt) {
    var bullets = this.bullets;
    var bullets_index = bullets.length - 1;
    while (bullets_index >= 0) {
      var bullet = bullets[bullets_index];
      if (!bullet) {
        return;
      }
      bullet.step(dt);
      this.checkColliding(bullet);
      // bullet out of screen
      if (bullet.x > this.max_radius || bullet.y > this.max_radius) {
        bullets.splice(bullets_index, 1);
      }
      bullets_index -= 1;
    };
  }
  render(app, deltaPoint = {x:0, y:0}) {
    this.bullets.forEach(function(bullet) {
      bullet.render(app, deltaPoint);
    });
  }
  upgrade(type, value, isMultiply) {
    if (!isMultiply) {
      this[type] += value;
    } else {
      this[type] *= value;
    }
    switch (type) {
      case "colddown":
        this[type] = this[type] < 0.001 ? 0.001 : this[type];
        break;
    }
  }
}

class Bomb extends Ball {
  constructor(options) {
    const defaults = {
      image: "items/bomb",
      countdown: 10,
      radius: 0,
      width: 60,
      height: 60,
      checkColliding() {},
      warning_radius: 0
    };
    const populated = Object.assign(defaults, options);
    super(populated);
  }
  step(dt) {
    this.warning_radius += this.radius*dt*(1/this.countdown);
  }
  renderImage(app, deltaPoint = {x:0, y:0}) {
    super.renderImage(app, deltaPoint);
    var x = this.x + deltaPoint.x + this.width/2;
    var y = this.y + deltaPoint.y + this.height/2;
    app.layer.beginPath();
    app.layer.strokeStyle("#f00");
    app.layer.arc(x, y, this.warning_radius, 0, 2*Math.PI);
    app.layer.stroke();
  }
  isReadyBoom() {
    return this.warning_radius > this.radius;
  }
}

// server side
if ('undefined' != typeof global) {
  module.exports = {
    Zombie: Zombie,
    Ball: Ball,
    Thomas: Thomas,
    Item: Item,
    Gun: Gun,
    Bomb: Bomb
  };
}