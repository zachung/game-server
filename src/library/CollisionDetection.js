class CollisionDetection {
  static CircleRectColliding(circle, rect) {
    var distX = Math.abs(circle.x - rect.x - rect.width / 2);
    var distY = Math.abs(circle.y - rect.y - rect.height / 2);

    if (distX > (rect.width / 2 + circle.radius)) { return false; }
    if (distY > (rect.height / 2 + circle.radius)) { return false; }

    if (distX <= (rect.width / 2)) { return true; }
    if (distY <= (rect.height / 2)) { return true; }

    var dx = distX - rect.width / 2;
    var dy = distY - rect.height / 2;
    return (dx * dx + dy * dy <= (circle.radius * circle.radius));
  }
  static RectRectColliding(rect1, rect2) {
    if (rect1.x < rect2.x + rect2.width &&
      rect1.x + rect1.width > rect2.x &&
      rect1.y < rect2.y + rect2.height &&
      rect1.height + rect1.y > rect2.y) {
      // collision detected!
      return true;
    }
    return false;
  }
  static RectPointColliding(rect, point) {
    if (rect.x <= point.x &&
      rect.x + rect.width >= point.x &&
      rect.y <= point.y &&
      rect.height + rect.y >= point.y) {
      // collision detected!
      return true;
    }
    return false;
  }
  static RectRectAngle(rect1, rect2) {
    let r1 = {
      hw: (rect1.width || 0) / 2, // half width
      hh: (rect1.height || 0) / 2 // half height
    };
    let r2 = {
      hw: (rect2.width || 0) / 2,
      hh: (rect2.height || 0) / 2
    };
    var rect1_center = {
      x: rect1.x + r1.hw,
      y: rect1.y + r1.hh
    };
    var rect2_center = {
      x: rect2.x + r2.hw,
      y: rect2.y + r2.hh
    };
    return this.getAngle(rect1_center, rect2_center);
  }
  /**
   * two rect distance
   *
   * @param      {object}  rect1   The rectangle 1
   * @param      {object}  rect2   The rectangle 2
   * @return     {number}  distance of two rect, if negative that's means two rect center distance(already touch each other)
   */
  static RectRectDistance(rect1, rect2) {
    let r1 = {
      hw: (rect1.width || 0) / 2, // half width
      hh: (rect1.height || 0) / 2 // half height
    };
    let r2 = {
      hw: (rect2.width || 0) / 2,
      hh: (rect2.height || 0) / 2
    };
    var rect1_center = {
      x: rect1.x + r1.hw,
      y: rect1.y + r1.hh
    };
    var rect2_center = {
      x: rect2.x + r2.hw,
      y: rect2.y + r2.hh
    };
    // direct distance
    var distance = Math.sqrt(Math.pow(rect2.x - rect1.x, 2) + Math.pow(rect2.y - rect1.y, 2));

    let hpi = Math.PI / 2;
    var rect1_angle = this.getAngle(rect1, rect1_center) % hpi;
    var rect2_angle = this.getAngle(rect2, rect2_center) % hpi;
    // if from center to other's angle (0~90)
    // < rect2_angle
    // will go through the height side

    let go_through_angle = this.getAngle(rect2_center, rect1_center);
    // 0, 90, 180, 270
    if (go_through_angle % Math.PI === 0) {
      distance -= r1.hw + r2.hw;
    } else if (go_through_angle % hpi === 0) {
      distance -= r1.hh + r2.hh;
    } else {
      go_through_angle %= hpi;
      let
        dx = Math.cos(go_through_angle),
        dy = Math.sin(go_through_angle);
      // no area through
      if (rect1_angle !== 0) {
        if (go_through_angle < rect1_angle) {
          // go through the rect1 height side
          distance -= r1.hw / dx;
        } else {
          // go through the rect1 width side
          distance -= r1.hh / dy;
        }
      }
      // no area through
      if (rect2_angle !== 0) {
        if (go_through_angle < rect2_angle) {
          // go through the rect2 height side
          distance -= r2.hw / dx;
        } else {
          // go through the rect2 width side
          distance -= r2.hh / dy;
        }
      }
    }
    if (distance <= 0) {
      // touch!! return two center distance.
      return -Math.sqrt(Math.pow(rect2_center.x - rect1_center.x, 2) + Math.pow(rect2_center.y - rect1_center.y, 2));
    }

    return distance;
  }
  static getAngle(p1, p2) {
    var angle = Math.atan2(p2.y - p1.y, p2.x - p1.x);
    if (angle < 0) angle += Math.PI * 2;
    return angle;
  }
  static CircleRectDistance(circle, rect) {
    var circle_center = {
      x: circle.x + Math.cos(Math.PI / 2) * circle.radius,
      y: circle.y + Math.cos(Math.PI / 2) * circle.radius
    };
    var rect_center = {
      x: rect.x + rect.width / 2,
      y: rect.y + rect.height / 2
    };
    // direct distance
    var distance = Math.pow(Math.sqrt(rect.x - circle.x) + Math.sqrt(rect.y - circle.y), 2);

    var rect_angle = this.getAngle(rect_center, rect);
    // if from center to other's angle (0~90)
    // < rect_angle
    // will go through the height side

    var go_through_angle = this.getAngle(circle_center, rect_center);
    if (go_through_angle < rect_angle) {
      // go through the height side
      distance -= rect.width / 2 / Math.cos(go_through_angle);
    } else {
      // go through the width side
      distance -= rect.height / 2 / Math.sin(go_through_angle);
    }
    distance -= circle.radius;

    return distance;
  }
}

module.exports = CollisionDetection;