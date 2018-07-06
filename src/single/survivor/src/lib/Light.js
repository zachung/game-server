import { Graphics } from './PIXI'
import { CEIL_SIZE } from '../config/constants'

const LIGHT = Symbol('light')

class Light {
  static lightOn (target, radius, rand = 1) {
    let container = target.parent
    if (!container.lighting) {
      console.error('container does NOT has lighting property')
      return
    }
    var lightbulb = new Graphics()
    var rr = 0xff
    var rg = 0xff
    var rb = 0xff
    var rad = radius * CEIL_SIZE

    let x = target.width / 2 / target.scale.x
    let y = target.height / 2 / target.scale.y
    lightbulb.beginFill((rr << 16) + (rg << 8) + rb, 1.0)
    lightbulb.drawCircle(x, y, rad)
    lightbulb.endFill()
    lightbulb.parentLayer = container.lighting // must has property: lighting

    target[LIGHT] = {
      light: lightbulb
    }
    target.addChild(lightbulb)

    if (rand !== 1) {
      let interval = setInterval(() => {
        let dScale = Math.random() * (1 - rand)
        if (lightbulb.scale.x > 1) {
          dScale = -dScale
        }
        lightbulb.scale.x += dScale
        lightbulb.scale.y += dScale
        lightbulb.alpha += dScale
      }, 1000 / 12)
      target[LIGHT].interval = interval
    }
  }

  static lightOff (target) {
    // remove light
    target.removeChild(target[LIGHT].light)
    // remove interval
    clearInterval(target[LIGHT].interval)
    delete target[LIGHT]
    // remove listener
    target.off('removed', Light.lightOff)
  }
}

export default Light
