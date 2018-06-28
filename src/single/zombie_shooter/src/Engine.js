import Item from './GameObject/Item'
import Thomas from './GameObject/Thomas'
import Zombie from './GameObject/Zombie'
import Gun from './GameObject/Gun'

import CollisionDetection from './Collision'
import ScrollingBackground from './ScrollingBackground'
import Score from './Score'

var ENGINE = {
  Resource: {},
  difficulty: 10
}
var collisionDetection = new CollisionDetection()

ENGINE.Intro = {

  level: 1,

  create: function () {
    this.app.scrollingBackground = new ScrollingBackground(this.app.images.background)
    this.app.scrollingBackground.init(this.app.width, this.app.height)

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

  enter: function () {

  },

  step: function (dt) {},

  render: function (dt) {
    var addButton = this.addButton
    var minusButton = this.minusButton
    var startButton = this.startButton

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
      ENGINE.difficulty = this.level
      this.app.setState(ENGINE.Game)
    }
  }

}

ENGINE.Game = {

  create: function () {
    ENGINE.levelData = new LevelData(this.app.data.levels[ENGINE.difficulty])
  },

  enter: function () {
    var maxRadius = Math.max(this.app.width, this.app.height)

    this.app.scrollingBackground = new ScrollingBackground(this.app.images.background)
    this.app.scrollingBackground.init(this.app.width, this.app.height)

    this.app.thomas = new Thomas({
      speed: 128,
      x: this.app.center.x,
      y: this.app.center.y,
      hp: 10,
      defence: 1
    })
    var gun = new Gun({
      maxRadius: maxRadius,
      colddown: ENGINE.levelData.gunColddown
    })
    this.app.thomas.takeWeapon(gun)

    ENGINE.Resource = this.app.music.play('music', true)
    ENGINE.enemies = []
    ENGINE.bullets = []
    ENGINE.items = []
    ENGINE.score = new Score()
  },

  step: function (dt) {
    var maxRadius = Math.max(this.app.width, this.app.height)
    // thomas
    var thomas = this.app.thomas
    // background
    var delta = this.app.scrollingBackground.move(thomas.speed * dt)

    // enemies
    var enemies = ENGINE.enemies
    if (Math.random() < ENGINE.levelData.monsterSpawnRate) {
      // new place
      var minRadius = ENGINE.levelData.monsterSpawnRadiusMin
      var spawnRadius = Math.random() * (maxRadius - minRadius) + minRadius
      var radians = Math.floor(Math.random() * 360)
      var enemy = new Zombie({
        speed: ENGINE.levelData.monsterSpeed,
        x: Math.cos(radians) * spawnRadius,
        y: Math.sin(radians) * spawnRadius,
        directRadians: -radians
      })
      enemies.push(enemy)
    }
    // enemies running
    enemies.forEach(enemy => {
      enemy.faceTo(thomas.x, thomas.y)
      enemy.run(dt)
      enemy.x -= delta[0]
      enemy.y -= delta[1]
      if (collisionDetection.RectRectColliding(enemy, thomas)) {
        console.log('collission')
        if (!thomas.getDamage(enemy.damage * dt)) {
          this.app.music.stop(ENGINE.Resource)
          this.app.setState(ENGINE.Game)
        }
      }
    })
    // shoot
    thomas.attack(enemies, dt)

    // gen item
    var items = ENGINE.items
    if (items.length < 10) {
      var item = new Item({
        x: Math.random() * this.app.width,
        y: Math.random() * this.app.height,
        type: Item.gunColddown,
        value: -0.01
      })
      items.push(item)
    }
    items.forEach(item => {
      item.x -= delta[0]
      item.y -= delta[1]
      if (collisionDetection.RectRectColliding(item, thomas)) {
        console.log('get item')
        thomas.getItem(item)
        items.splice(items.indexOf(item), 1)
      }
    })
  },

  render: function (dt) {
    var app = this.app
    var thomas = this.app.thomas

    app.layer.clear('#000')
    // background
    app.scrollingBackground.render(app)

    app.layer
      .font('40px Georgia')
      .fillText('Current: ' + ENGINE.score.getScore(), app.width - 300, 160)
      .font('40px Green')
      .fillText('High: ' + ENGINE.score.getHighScore(), app.width - 300, 80)
      // hp
      .fillStyle('#000')
      .fillRect(20, 20, 300, 30)
      .fillStyle('#F00')
      .fillRect(20, 20, 300 * (thomas.hp / thomas.hpMax), 30)

    app.thomas.render(app.layer)
    ENGINE.enemies.forEach(enemy => {
      enemy.render(app)
    })
    ENGINE.items.forEach(item => {
      item.render(app.layer)
    })
  },

  keydown: function (data) {
    var direct = 0b0000
    switch (data.key) {
      case 'a':
        direct |= 0b1000
        break
      case 'd':
        direct |= 0b0100
        break
      case 'w':
        direct |= 0b0010
        break
      case 's':
        direct |= 0b0001
        break
    }
    this.app.scrollingBackground.faceTo(direct)
  },

  keyup: function (data) {
    var direct = 0b1111
    switch (data.key) {
      case 'a':
        direct &= 0b0111
        break
      case 'd':
        direct &= 0b1011
        break
      case 'w':
        direct &= 0b1101
        break
      case 's':
        direct &= 0b1110
        break
    }
    this.app.scrollingBackground.faceCancel(direct)
  },

  mousemove: function (data) {
    this.app.thomas.faceTo(data.x, data.y)
  }

}

var LevelData = function (data) {
  return new Proxy(data, {
    get (target, name) {
      var val = data[name]
      return val
    }
  })
}

export default ENGINE
