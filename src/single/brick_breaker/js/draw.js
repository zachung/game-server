var canvas;
var raf;
var collisionDetection = new CollisionDetection();
var running = false;
var rect = new Rect();
var bricks = [];
var score = 0;
var duration = 0;

function draw() {
  canvas = document.getElementById("canvas");
  var ctx = canvas.getContext("2d");
  var width = canvas.width;
  var height = canvas.height;

  ctx.clearRect(0, 0, width, height); // clear canvas

  // 方
  rect.draw(canvas);

  // time
  // ctx.font = "10pt Arial";
  // ctx.textAlign = "right";
  // ctx.fillText((new Date()).format(), width, 10);

  // score
  ctx.font = "10pt Arial";
  ctx.textAlign = "right";
  ctx.fillText(score, width, 10);

  // ball
  ball.draw(canvas)

  // bricks
  bricks.forEach(function(brick, i) {
    brick.draw(canvas);
    if (collisionDetection.CircleRectColliding(ball, brick)) {
      console.log('break brick !!');
      bricks.splice(i, 1);
      score += 1;
      ball.vy = -ball.vy;
    }
  })

  // collision detection
  if (collisionDetection.CircleRectColliding(ball, rect)) {
    ball.vy = -ball.vy;
    console.log('collision');
  }

  // stop game!
  if (ball.y > canvas.height - 20) {
    window.cancelAnimationFrame(raf);
    running = false;
    init();
    return;
  }

  if (running) {
    raf = window.requestAnimationFrame(draw);
  }
}

function onload() {
  init();
  draw();
  // mouse control rect location
  canvas.addEventListener('mousemove', function(e) {
    rect.x = e.clientX - rect.w / 2;
  });

  // start game
  canvas.addEventListener('click', function(e) {
    if (!running) {
      init();
      raf = window.requestAnimationFrame(draw);
      running = true;
    }
  });
}

function init() {
  score = 0;
  duration = 0;

  // paint
  canvas = document.getElementById("canvas");
  rect.x = canvas.width / 2 - rect.w;
  rect.y = canvas.height - rect.h - 30;
  ball.x = rect.x + rect.w/2;
  ball.y = rect.y - rect.h/2 - ball.r/2;

  // init bricks
  bricks = [];
  map().forEach(function(point) {
    var brick = new Rect();
    brick.x = point[0];
    brick.y = point[1];
    bricks.push(brick);
  });
}