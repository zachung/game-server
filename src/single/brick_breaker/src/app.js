import { map } from './level/class1'
import { Ball, Rect, Rect as Paddle, CollisionDetection } from './library'

let canvas
let raf
let collisionDetection = new CollisionDetection()
let isRunning = false
let paddle = new Paddle()
let bricks = []
let score = 0
let ball

function draw () {
  canvas = document.getElementById('canvas')
  let ctx = canvas.getContext('2d')
  let width = canvas.width
  let height = canvas.height

  ctx.clearRect(0, 0, width, height) // clear canvas

  // paddle
  paddle.draw(canvas)

  // score
  ctx.font = '10pt Arial'
  ctx.textAlign = 'right'
  ctx.fillText(score, width, 10)

  // ball
  ball.draw(canvas)

  // bricks
  bricks.forEach(function (brick, i) {
    brick.draw(canvas)
    if (collisionDetection.CircleRectColliding(ball, brick)) {
      console.log('break brick !!')
      bricks.splice(i, 1)
      score += 1
      ball.vy = -ball.vy
    }
  })

  // collision detection
  if (collisionDetection.CircleRectColliding(ball, paddle)) {
    ball.vy = -ball.vy
    console.log('collision')
  }

  // stop game!
  if (ball.y > canvas.height - 20) {
    window.cancelAnimationFrame(raf)
    isRunning = false
    init()
    return
  }

  if (isRunning) {
    raf = window.requestAnimationFrame(draw)
  }
}

function init () {
  score = 0

  // paint
  canvas = document.getElementById('canvas')
  paddle.x = canvas.width / 2 - paddle.w
  paddle.y = canvas.height - paddle.h - 30
  ball = new Ball({
    x: paddle.x + paddle.w / 2,
    y: paddle.y - paddle.h / 2 - 5,
    r: 10
  })

  // init bricks
  bricks = []
  map.forEach(function (point) {
    bricks.push(new Rect({
      x: point[0],
      y: point[1]
    }))
  })
}

(() => {
  init()
  draw()
  // mouse control paddle location
  canvas.addEventListener('mousemove', function (e) {
    paddle.x = e.clientX - paddle.w / 2
  })

  // start game
  canvas.addEventListener('click', function (e) {
    if (!isRunning) {
      init()
      raf = window.requestAnimationFrame(draw)
      isRunning = true
    }
  })
})()
