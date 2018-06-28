import { resources, Sprite } from '../pixi'
import keyboard from '../keyboard'

class Cat extends Sprite {
  constructor () {
    // Create the cat sprite
    super(resources['images/cat.png'].texture)

    // Change the sprite's position
    this.x = 96
    this.y = 96
    this.vx = 0
    this.vy = 0

    this.init()
  }

  init () {
    // Capture the keyboard arrow keys
    let left = keyboard(37)
    let up = keyboard(38)
    let right = keyboard(39)
    let down = keyboard(40)

    // Left arrow key `press` method
    left.press = () => {
      // Change the cat's velocity when the key is pressed
      this.vx = -5
      this.vy = 0
    }

    // Left arrow key `release` method
    left.release = () => {
      // If the left arrow has been released, and the right arrow isn't down,
      // and the cat isn't moving vertically:
      // Stop the cat
      if (!right.isDown && this.vy === 0) {
        this.vx = 0
      }
    }

    // Up
    up.press = () => {
      this.vy = -5
      this.vx = 0
    }
    up.release = () => {
      if (!down.isDown && this.vx === 0) {
        this.vy = 0
      }
    }

    // Right
    right.press = () => {
      this.vx = 5
      this.vy = 0
    }
    right.release = () => {
      if (!left.isDown && this.vy === 0) {
        this.vx = 0
      }
    }

    // Down
    down.press = () => {
      this.vy = 5
      this.vx = 0
    }
    down.release = () => {
      if (!up.isDown && this.vx === 0) {
        this.vy = 0
      }
    }
  }

  tick (delta) {
    this.x += this.vx
    this.y += this.vy
  }
}

export default Cat
