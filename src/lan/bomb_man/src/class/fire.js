"use strict";

const Floor = require('./floor')

class Fire extends Floor {
  constructor(options) {
    const defaults = {
      image: "items/fire",
      countdown: 0.7,
      width: 60,
      height: 60,
      damage: 2,
      hp: 100000,
      animationSize: 30
    };
    const populated = Object.assign(defaults, options);
    super(populated);
    this.class = this.constructor.name;
  }
  step(dt, map, cell) {
    this.animationSize += dt * this.width * 2; // animation speed
    this.countdown -= dt;
    this.attack(cell, dt);
    if (this.countdown < 0) {
      this.die(map);
    }
  }
  render(app, deltaPoint = { x: 0, y: 0 }) {
    this.renderImage(app, deltaPoint);
  }
  renderImage(app, deltaPoint = { x: 0, y: 0 }) {
    var range = 0.1;
    var direct = Math.floor(this.animationSize / this.width / range) % 2;
    var size = this.animationSize % (this.width * range);
    var d = (direct === 1 ? size : this.width * range - size);
    var animationSize = this.width + d;
    app.layer.drawImage(app.images[this.image], this.x + deltaPoint.x, this.y + deltaPoint.y - d, animationSize, animationSize);
  }
}

module.exports = Fire;