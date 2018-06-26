import Ball from './Ball'
import CollisionDetection from './Collision'
import ScrollingBackground from './ScrollingBackground'
import Score from './Score'

let Engine = {
  Resource: {},
  difficulty: 0
}
let collisionDetection = new CollisionDetection()

Engine.Intro = {

  level: 1,

  enter: function () {

  },

  create: function () {
    this.app.scrollingBackground = new ScrollingBackground(this.app.images.background)
    this.app.scrollingBackground.init(this.app.width, this.app.height)

    this.app.thomas = new Ball()
    this.app.thomas.x = this.app.center.x
    this.app.thomas.y = this.app.center.y

    this.addButton = {
      text: '＋',
      x: this.app.center.x + 200,
      y: this.app.center.y,
      width: 40,
      height: 40,
      background_color: '#eee'
    }
    this.minusButton = {
      text: '－',
      x: this.app.center.x - 200,
      y: this.app.center.y,
      width: 40,
      height: 40,
      background_color: '#eee'
    }
    this.startButton = {
      text: 'Start',
      x: this.app.center.x,
      y: this.app.center.y + 200,
      width: 80,
      height: 40,
      background_color: '#eee'
    }
  },

  step: function (dt) {
  },

  render: function (dt) {
    let addButton = this.addButton
    let minusButton = this.minusButton
    let startButton = this.startButton

    this.app.layer.clear('#000')
    // background
    this.app.scrollingBackground.render(this.app)

    this.app.layer
      .font('40px Georgia')
      .fillText('Level: ' + this.level, this.app.center.x - 30, this.app.center.y)
      .fillStyle(addButton.height + 'px #abc')
      .textWithBackground(addButton.text, addButton.x, addButton.y, addButton.background_color)
      .fillStyle(minusButton.height + 'px #abc')
      .textWithBackground(minusButton.text, minusButton.x, minusButton.y, minusButton.background_color)
      .fillStyle(startButton.height + 'px #abc')
      .textWithBackground(startButton.text, startButton.x, startButton.y, startButton.background_color)
  },

  mousedown: function (data) {
    if (collisionDetection.RectPointColliding(this.addButton, data)) {
      this.level++
    }
    if (collisionDetection.RectPointColliding(this.minusButton, data)) {
      this.level--
    }
    if (this.level > 10) this.level = 10
    if (this.level < 1) this.level = 1

    // larger harder
    if (collisionDetection.RectPointColliding(this.startButton, data)) {
      Engine.difficulty = this.level / 10
      this.app.setState(Engine.Game)
    }
  }

}

Engine.Game = {

  enter: function () {
    Engine.Resource = this.app.music.play('music', true)
    Engine.enemies = []
    Engine.score = new Score()
  },

  create: function () {
    this.app.scrollingBackground = new ScrollingBackground(this.app.images.background)
    this.app.scrollingBackground.init(this.app.width, this.app.height)

    this.app.thomas = new Ball()
    this.app.thomas.x = this.app.center.x
    this.app.thomas.y = this.app.center.y
  },

  step: function (dt) {
    // thomas
    let thomas = this.app.thomas
    // background
    let delta = this.app.scrollingBackground.move(thomas.speed * dt)

    // calc distance
    Engine.score.add(-delta[1] * Engine.difficulty)
    Engine.score.save()

    // enemies
    let enemies = Engine.enemies
    if (Engine.score.newScore() && Math.random() < Engine.difficulty) {
      // new place
      let enemy = new Ball()
      enemy.speed = 256
      enemy.x = Math.random() * this.app.width
      enemy.y = 0
      enemy.directRadians = Math.asin(1)
      enemy.color = '#e24fa2'
      enemies.push(enemy)
    }
    // enemies running
    enemies.forEach(enemy => {
      enemy.run(dt)
      enemy.x -= delta[0]
      enemy.y -= delta[1]
      if (collisionDetection.RectRectColliding(enemy, thomas)) {
        console.log('collission')
        this.app.music.stop(Engine.Resource)
        this.app.setState(Engine.Game)
      }
    })
    let enemiesIndex = enemies.length - 1
    while (enemiesIndex >= 0) {
      if (enemies[enemiesIndex].y > this.app.height) {
        enemies.splice(enemiesIndex, 1)
      }
      enemiesIndex -= 1
    }
  },

  render: function (dt) {
    let thomas = this.app.thomas

    this.app.layer.clear('#000')
    // background
    this.app.scrollingBackground.render(this.app)

    this.app.layer
      .fillStyle(thomas.color)
      .fillRect(thomas.x, thomas.y, thomas.width, thomas.height)
      .font('40px Georgia')
      .fillText('Current: ' + Engine.score.getScore(), this.app.width - 300, 160)
      .font('40px Green')
      .fillText('High: ' + Engine.score.getHighScore(), this.app.width - 300, 80)

    Engine.enemies.forEach(enemy => {
      this.app.layer
        .fillStyle(enemy.color)
        .fillRect(enemy.x, enemy.y, enemy.width, enemy.height)
    })
  },

  mousedown: function () {

    // this.app.sound.play("laser");

  },

  mousemove: function (data) {
    this.app.scrollingBackground.directRadians = Math.atan2(data.y - this.app.center.y, data.x - this.app.center.x)
  }

}

export default Engine
