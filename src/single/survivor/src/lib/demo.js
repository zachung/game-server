import keyboardJS from 'keyboardjs'
import { LEFT, UP, RIGHT, DOWN } from '../config/control'

let delay = s => {
  return new Promise(resolve => {
    setTimeout(resolve, s)
  })
}

delay().then(() => {
  keyboardJS.pressKey(DOWN)
  return delay(1200)
}).then(() => {
  keyboardJS.releaseKey(DOWN)
  keyboardJS.pressKey(RIGHT)
  return delay(800)
}).then(() => {
  keyboardJS.releaseKey(RIGHT)
  keyboardJS.pressKey(UP)
  return delay(1000)
}).then(() => {
  keyboardJS.releaseKey(UP)
  keyboardJS.pressKey(LEFT)
  return delay(400)
}).then(() => {
  keyboardJS.releaseKey(LEFT)
  keyboardJS.pressKey(DOWN)
  return delay(800)
}).then(() => {
  keyboardJS.releaseKey(DOWN)
  keyboardJS.pressKey(UP)
  return delay(800)
})
