class Group {
  constructor(...args) {
    this.x = 0;
    this.y = 0;
    this.set = new Set();
  }
  add(...args) {
    return this.set.add(...args);
  }
  delete(...args) {
    return this.set.delete(...args);
  }
  has(...args) {
    return this.set.has(...args);
  }
  get size() {
    return this.set.size;
  }
  forEach(callback) {
    return this.set.forEach(callback);
  }
  some(callback) {
    let some = false;
    this.set.forEach((...args) => {
      if (some) {
        return;
      }
      if (callback(...args)) {
        some = true;
      }
    });
    return some;
  }
  step(dt) {
    this.set.forEach(graphic => graphic.step(dt));
  }
  render(app, deltaPoint = { x: 0, y: 0 }) {
    let delta = {
      x: this.x + deltaPoint.x,
      y: this.y + deltaPoint.y
    }
    this.set.forEach(graphic => graphic.render(app, delta));
  }
}

module.exports = Group;