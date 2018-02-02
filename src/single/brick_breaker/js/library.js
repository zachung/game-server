Date.prototype.format = function() {
  var myDate = this,
    month = '' + (myDate.getMonth() + 1),
    day = '' + myDate.getDate(),
    year = myDate.getFullYear();

  if (month.length < 2) month = '0' + month;
  if (day.length < 2) day = '0' + day;

  return [year, month, day].join('-') + " " + [myDate.getHours(), myDate.getMinutes(), myDate.getSeconds()].join(':');
}

var ball = {
  x: 100,
  y: 100,
  vx: 5,
  vy: -2,
  r: 10,
  color: 'blue',
  draw: function(canvas) {
    var ctx = canvas.getContext("2d");
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.fillStyle = this.color;
    ctx.fill();
    // 如果下一個frame超出y
    if (ball.y + ball.vy > canvas.height - this.r || ball.y + ball.vy < this.r) {
      ball.vy = -ball.vy;
    }
    if (ball.x + ball.vx > canvas.width - this.r || ball.x + ball.vx < this.r) {
      ball.vx = -ball.vx;
    }
    ball.x += ball.vx;
    ball.y += ball.vy;
  }
};

var Rect = function() {
  this.x = 20;
  this.y = 20;
  this.w = 40;
  this.h = 15;
  this.color = 'rgb(200,0,0)';
  this.draw = function(canvas) {
    var ctx = canvas.getContext("2d");
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, this.w, this.h);
  }
};

var CollisionDetection = function() {
  this.collidingRecord = [];
  this.collidingDelay = 1000; //ms
  this.CircleRectColliding = function(circle, rect) {
    // delay
    if (this.collidingRecord[circle]
      && this.collidingRecord[circle].with === rect
      && (new Date()).getTime() < this.collidingRecord[circle].time.getTime() + this.collidingDelay) {
      return false;
    }
    var distX = Math.abs(circle.x - rect.x - rect.w / 2);
    var distY = Math.abs(circle.y - rect.y - rect.h / 2);

    if (distX > (rect.w / 2 + circle.r)) { return false; }
    if (distY > (rect.h / 2 + circle.r)) { return false; }

    if (distX <= (rect.w / 2)) { return true; }
    if (distY <= (rect.h / 2)) { return true; }

    var dx = distX - rect.w / 2;
    var dy = distY - rect.h / 2;
    var isCollision = (dx * dx + dy * dy <= (circle.r * circle.r));
    if (isCollision) {
      this.collidingRecord[circle] = {
        with: rect,
        time: new Date()
      }
    }
    return isCollision;
  }
}