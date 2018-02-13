const Ball = require('./ball')
const Floor = require('./floor')
const Wall = require('./wall')
const Block = require('./block')
const Thomas = require('./thomas')
const Bomb = require('./bomb')
const Fire = require('./fire')
const Item = require('./item')

class Cell extends Ball {
  constructor(options) {
    const defaults = {
      width: 64,
      height: 64,
      standInObjects: []
    };
    const populated = Object.assign(defaults, options);
    super(populated);

    var i = this.i, j = this.j;
    if (this.standInObjects.length !== 0) {
      this.standInObjects = this.standInObjects.map(function(object) {
        var instance = null;
        switch (object.class) {
          case "Floor":
            instance = new Floor(object);
            break;
          case "Wall":
            instance = new Wall(object);
            break;
          case "Block":
            instance = new Block(object);
            break;
          case "Thomas":
            instance = new Thomas(object);
            break;
          case "Bomb":
            instance = new Bomb(object);
            break;
          case "Fire":
            instance = new Fire(object);
            break;
          case "Item":
            instance = new Item(object);
            break;
        }
        return instance;
      });
    }
  }
  in(object) {
    if (object.class === "Thomas") {
      this.standInObjects.filter(object => object.class === "Item").forEach(function(item) {
        item.sendTo(object);
        item.die();
      });
    }
    this.standInObjects.push(object);
    object.inMapLocation = {
      i: this.i,
      j: this.j
    };
  }
  out(object) {
    var objects = this.standInObjects;
    var index = objects.indexOf(object);
    if (-1 !== index) {
      objects.splice(index, 1);
    }
  }
  _tryTouchOtherCell(object) {
    var cell = this;
    var tx = 0,
      ty = 0;
    var object_side = {
      r: object.x + object.width,
      l: object.x,
      d: object.y + object.height,
      u: object.y,
    };
    var cell_side = {
      r: cell.x + cell.width,
      l: cell.x,
      d: cell.y + cell.height,
      u: cell.y,
    }
    if (object_side.r > cell_side.r) {
      tx++;
    }
    if (object_side.l < cell_side.l) {
      tx--;
    }
    if (object_side.d > cell_side.d) {
      ty++;
    }
    if (object_side.u < cell_side.u) {
      ty--;
    }
    return {
      x: tx,
      y: ty
    };
  }
  step(dt, map) {
    var cell = this;
    super.step(dt);
    this.standInObjects.forEach(function(object, i) {
      object.step(dt, map, cell);
      // try hold object in cell center
      var object_center = {
        x: object.x + object.width / 2,
        y: object.y + object.height / 2
      };
      var cell_center = {
        x: cell.x + cell.width / 2,
        y: cell.y + cell.height / 2
      };
      var cdx = object_center.x - cell_center.x;
      var cdy = object_center.y - cell_center.y;
      // try touch other cell
      var touch_vector = cell._tryTouchOtherCell(object);
      var move_vector = object.getMoveVector(dt);
      if (!map.canGetIn(cell.i + touch_vector.x, cell.j)) {
        // go back
        object.x += -touch_vector.x * object.speed * dt;
      }
      if (!map.canGetIn(cell.i, cell.j + touch_vector.y)) {
        // go back
        object.y += -touch_vector.y * object.speed * dt;
      }
      // go other cell
      var dx = 0,
        dy = 0,
        side_buffer = 0
        ;
      var object_center = {
        x: object.x + object.width / 2,
        y: object.y + object.height / 2
      };
      var cell_side = {
        r: cell.x + cell.width + side_buffer,
        l: cell.x - side_buffer,
        d: cell.y + cell.height + side_buffer,
        u: cell.y - side_buffer,
      }
      if (object_center.x > cell_side.r) {
        // right
        dx++;
      } else if (object_center.x < cell_side.l) {
        // left
        dx--;
      } else if (object_center.y > cell_side.d) {
        // down
        dy++;
      } else if (object_center.y < cell_side.u) {
        // up
        dy--;
      }
      if (dx === 0 && dy === 0) {
        return;
      }
      // move to (i + dx, j + dy)
      map.moveObject(object, dx, dy);
    });
  }
  getDamage(damage, dt = 1) {
    super.getDamage(damage, dt);
    this.standInObjects.forEach(function(object, i) {
      object.getDamage(damage, dt);
    });
  }
  canGetIn() {
    var canGetIn = true;
    this.standInObjects.forEach(function(object) {
      if (-1 !== ["Wall", "Block", "Bomb"].indexOf(object.class)) {
        canGetIn = false;
      }
    });
    return canGetIn;
  }
  canFire() {
    var handle = true;
    this.standInObjects.some(function(object) {
      var index = ["Wall"].indexOf(object.class);
      if (-1 !== index) {
        handle = false;
        return true;
      }
      return false;
    });
    return handle;
  }
}

module.exports = Cell;