const Game = require('../../library/Lobby')
const Zombie = require('./public/js/ball.js').Zombie
const Thomas = require('./public/js/ball.js').Thomas
const Item = require('./public/js/ball.js').Item
const Gun = require('./public/js/ball.js').Gun
const Bomb = require('./public/js/ball.js').Bomb
const CollisionDetection = require('./public/js/collision.js')

var collisionDetection = new CollisionDetection()

const users = new Map()

const SocketEvent = {
  disconnect (user) {
    var id = user.id
    console.log('user ' + id + ' disconnect')
    users.delete(id)
  },
  user_move (user, direct) {
    user.faceDirectBits |= direct
  },
  user_move_not (user, direct) {
    user.faceDirectBits &= direct
  },
  user_mouse_move (user, data) {
    user.weapon.directRadians = data.directRadians
  },
  hit_monster (user, data) {
    var enemy_id = data[0]
    var damage = data[1]
    var enemy = this.enemies[enemy_id]
    if (!enemy) {
      // ememy is die
      return
    }
    // enemy get damage
    if (!enemy.getDamage(damage)) {
      // enemy die
      delete this.enemies[enemy_id]
    }
  },
  set_bomb (user) {
    this.spawnBomb(user.x, user.y)
  }
}

class ZombieShooter extends Game {
  static get nsp () {
    return '/zombie-shooter'
  }
  constructor () {
    super()
    this.enemies = {}
    this.observer = []
    this.items = {}
    this.bombs = {}
    this.width = 3000
    this.height = 2000

    this.monsterCountMax = 100
    this.gunColddown = 0.2
    this.gunMaxRadius = 3000
  }
  spawnItem (x, y) {
    if (Object.keys(this.items).length > 100) {
      return
    }
    // random item
    const item_map = [{
      type: Item.gunColddown,
      value: -0.01,
      image: 'items/weapon_speed_up',
      width: 80,
      height: 80
    }, {
      type: Item.health,
      value: 10,
      image: 'items/health',
      width: 60,
      height: 60
    }, {
      type: Item.runSpeedUp,
      value: 10,
      image: 'items/run_speed_up',
      width: 60,
      height: 60
    }]

    var r = Math.floor(Math.random() * Math.floor(3))
    var options = {
      id: id,
      x: x + Math.random() * this.width,
      y: y + Math.random() * this.height,
      expired: (new Date()).getTime() + 1000 * 60
    }
    options = Object.assign(options, item_map[r])

    var id = makeid()
    var item = new Item(options)
    this.items[id] = item
    return item
  }
  spawnBomb (x, y) {
    if (Object.keys(this.bombs).length > 100) {
      return
    }
    var id = makeid()
    var bomb = new Bomb({
      x: x,
      y: y,
      id: id,
      radius: 100,
      damage: 10,
      countdown: 5
    })
    this.bombs[id] = bomb
    return bomb
  }
  spawnEnemy (x, y) {
    if (Object.keys(this.enemies).length > this.monsterCountMax) {
      return
    }
    var id = makeid()
    var min_radius = 1000
    var max_radius = 2000
    var spawn_radius = Math.random() * (max_radius - min_radius) + min_radius
    var radians = Math.floor(Math.random() * 360)
    var enemy = new Zombie({
      speed: 128,
      x: x + Math.cos(radians) * spawn_radius,
      y: y + Math.sin(radians) * spawn_radius,
      directRadians: -radians,
      id: id,
      defence: 3,
      damage: 10,
      hp: 10,
      hpMax: 10
    })
    this.enemies[id] = enemy
    return enemy
  }
  registerObserver (callback) {
    this.observer.push(callback)
  }
  addUser (socket) {
    super.addUser(socket)
    var id = socket.id
    var user = new Thomas({
      x: 500,
      y: 500,
      id: id,
      hp: 100,
      hpMax: 100,
      speed: 256,
      color: '#' + (Math.random().toString(16) + '000000').slice(2, 8)
    })
    user.takeWeapon(new Gun({
      max_radius: this.gunMaxRadius,
      colddown: this.gunColddown,
      checkColliding (bullet) {
        var enemies = game.enemies
        for (const key in enemies) {
          if (enemies.hasOwnProperty(key)) {
            var bullets = this.bullets
            var enemy = enemies[key]
            if (collisionDetection.RectRectColliding(bullet, enemy)) {
              var enemy_id = enemy.id
              var damage = bullet.damage
              if (!enemy) {
                // ememy is die
                return
              }
              // enemy get damage
              if (!enemy.getDamage(damage)) {
                // enemy die
                delete enemies[enemy_id]
              }
              // add score
              // ENGINE.score.add(ENGINE.levelData.scorePreHit);
              // ENGINE.score.save();
              // bullet die
              if (!bullet.getDamage(enemy.defence)) {
                bullets.splice(bullets.indexOf(bullet), 1)
              }
            }
          }
        }
      }
    }))
    var game = this
    for (const key in SocketEvent) {
      if (SocketEvent.hasOwnProperty(key)) {
        socket.on(key, function () {
          var args = Array.from(arguments)
          args.unshift(user)
          SocketEvent[key].apply(game, args)
        })
      }
    }
    game.registerObserver(function (dt) {
      user.step(dt)
      user.attack(dt)
      socket.emit('set user', Array.from(users.values()))
      socket.emit('set enemies', game.enemies)
      socket.emit('set items', game.items)
      socket.emit('set bombs', game.bombs)
      // gen item
      var items = game.items
      for (const key in items) {
        if (items.hasOwnProperty(key)) {
          var item = items[key]
          if ((new Date()).getTime() > item.expired) {
            delete items[key]
            continue
          }
          if (collisionDetection.RectRectColliding(item, user)) {
            user.getItem(item)
            delete items[key]
          }
        }
      }
    })
    users.set(id, user)
  }
  removeUser (socket) {
    super.removeUser(socket)
    users.delete(socket.id)
  }
  nearsetUser (x, y) {
    var nearest
    var nearest_d
    users.forEach(user => {
      var a = user.x - x,
        b = user.y - y
      var user_d = Math.sqrt(a * a + b * b)
      if (!nearest) {
        nearest = user
        nearest_d = user_d
      } else {
        if (user_d < nearest_d) {
          nearest = user
          nearest_d = user_d
        }
      }
    })
    return nearest
  }
  step (dt) {
    super.step(dt)
    var game = this
    // enemies running
    var enemies = game.enemies
    Object.keys(game.enemies).map(function (key) {
      var enemy = game.enemies[key]
      // nearest user
      var user = game.nearsetUser(enemy.x, enemy.y)
      if (!user) {
        return
      }
      enemy.faceTo(user.x, user.y)
      enemy.step(dt)
      if (collisionDetection.RectRectColliding(enemy, user)) {
        if (!user.getDamage(enemy.damage * dt)) {
          console.log('user die')
          users.delete(user.id)
        }
      }
    })
    // bomb
    var bombs = game.bombs
    for (const key in bombs) {
      if (bombs.hasOwnProperty(key)) {
        var bomb = bombs[key]
        bomb.step(dt)
        if (bomb.isReadyBoom()) {
          delete bombs[key]
          // bomb enemies
          for (const key in enemies) {
            if (enemies.hasOwnProperty(key)) {
              var enemy = enemies[key]
              if (collisionDetection.CircleRectColliding(bomb, enemy)) {
                if (!enemy.getDamage(bomb.damage)) {
                  delete game.enemies[enemy.id]
                }
              }
            }
          }
          // bomb users
          users.forEach(user => {
            if (collisionDetection.CircleRectColliding(bomb, user)) {
              if (!user.getDamage(bomb.damage)) {
                users.delete(user.id)
              }
            }
          })
        }
      }
    }
    // bomb users
    users.forEach(user => {
      game.spawnEnemy(user.x, user.y)
      game.spawnItem(user.x, user.y)
    })
    // other step
    this.observer.forEach(function (f) {
      f(dt)
    })
  }
}

function makeid () {
  var text = ''
  var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'

  for (var i = 0; i < 5; i++) { text += possible.charAt(Math.floor(Math.random() * possible.length)) }

  return text
}

module.exports = ZombieShooter
