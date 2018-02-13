var CollisionDetection = function() {
  this.collidingRecord = [];
  this.collidingDelay = 0; //ms
  this.CircleRectColliding = function(circle, rect) {
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
  this.RectRectColliding = function(rect1, rect2) {
    if (rect1.x < rect2.x + rect2.width &&
      rect1.x + rect1.width > rect2.x &&
      rect1.y < rect2.y + rect2.height &&
      rect1.height + rect1.y > rect2.y) {
      // collision detected!
      return true;
    }
    return false;
  }
  this.RectPointColliding = function(rect, point) {
    if (rect.x <= point.x &&
      rect.x + rect.width >= point.x &&
      rect.y <= point.y &&
      rect.height + rect.y >= point.y) {
      // collision detected!
      return true;
    }
    return false;
  }
  this.RectRectAngle = function(rect1, rect2) {
    var rect1_center = {
      x: rect1.x + rect1.width/2,
      y: rect1.y + rect1.height/2
    };
    var rect2_center = {
      x: rect2.x + rect2.width/2,
      y: rect2.y + rect2.height/2
    };
    return this.getAngle(rect1_center, rect2_center);
  }
  this.RectRectDistance = function(rect1, rect2) {
    var rect1_center = {
      x: rect1.x + rect1.width/2,
      y: rect1.y + rect1.height/2
    };
    var rect2_center = {
      x: rect2.x + rect2.width/2,
      y: rect2.y + rect2.height/2
    };
    // direct distance
    var distance = Math.pow(Math.sqrt(rect2.x - rect1.x) + Math.sqrt(rect2.y - rect1.y), 2);

    var rect1_angle = this.getAngle(rect1_center, rect1);
    var rect2_angle = this.getAngle(rect2_center, rect2);
    // if from center to other's angle (0~90)
    // < rect2_angle
    // will go through the height side

    var go_through_angle = this.getAngle(rect1_center, rect2_center);
    if (go_through_angle < rect2_angle) {
      // go through the height side
      distance -= rect2.width/2/Math.cos(go_through_angle);
    } else {
      // go through the width side
      distance -= rect2.height/2/Math.sin(go_through_angle);
    }
    if (go_through_angle < rect1_angle) {
      // go through the height side
      distance -= rect1.width/2/Math.cos(go_through_angle);
    } else {
      // go through the width side
      distance -= rect1.height/2/Math.sin(go_through_angle);
    }

    return distance;
  }
  this.getAngle = function(p1, p2) {
    var angle = Math.atan2(p1.y - p2.y, p1.x - p2.x);
    if (angle < 0) angle += Math.PI*2;
    angle %= Math.PI/2;
    return angle;
  }
  this.CircleRectDistance = function(circle, rect) {
    var circle_center = {
      x: circle.x + Math.cos(Math.PI/2)*circle.radius,
      y: circle.y + Math.cos(Math.PI/2)*circle.radius
    };
    var rect_center = {
      x: rect.x + rect.width/2,
      y: rect.y + rect.height/2
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
      distance -= rect.width/2/Math.cos(go_through_angle);
    } else {
      // go through the width side
      distance -= rect.height/2/Math.sin(go_through_angle);
    }
    distance -= circle.radius;

    return distance;
  }
}

module.exports = CollisionDetection;