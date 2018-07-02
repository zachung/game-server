import { resources } from '../lib/PIXI'
import GameObject from './GameObject'
import keyboard from '../keyboard'

class Cat extends GameObject {
  constructor () {
    // Create the cat sprite
    super(resources['images/town_tiles.json'].textures['wall.png'])

    // Change the sprite's position
    this.dx = 0
    this.dy = 0

    this.init()
    this.tickAbilities = {}
    this.abilities = {}
  }

  takeAbility (ability) {
    if (ability.hasToReplace(this)) {
      ability.carryBy(this)
    }
  }

  toString () {
    return 'cat'
  }

  init () {
    // Capture the keyboard arrow keys
    let left = keyboard(65)
    let up = keyboard(87)
    let right = keyboard(68)
    let down = keyboard(83)

    // Left
    left.press = () => {
      this.dx = -1
      this.dy = 0
    }
    left.release = () => {
      if (!right.isDown && this.dy === 0) {
        this.dx = 0
      }
    }

    // Up
    up.press = () => {
      this.dy = -1
      this.dx = 0
    }
    up.release = () => {
      if (!down.isDown && this.dx === 0) {
        this.dy = 0
      }
    }

    // Right
    right.press = () => {
      this.dx = 1
      this.dy = 0
    }
    right.release = () => {
      if (!left.isDown && this.dy === 0) {
        this.dx = 0
      }
    }

    // Down
    down.press = () => {
      this.dy = 1
      this.dx = 0
    }
    down.release = () => {
      if (!up.isDown && this.dx === 0) {
        this.dy = 0
      }
    }
  }

  tick (delta) {
    Object.values(this.tickAbilities).forEach(ability => ability.tick(delta, this))
  }
}

export default Cat
