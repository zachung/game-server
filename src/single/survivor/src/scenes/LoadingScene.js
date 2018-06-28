import { Text, TextStyle } from '../pixi'
import Scene from '../Scene'

let text = 'loading'

class PlayScene extends Scene {
  constructor (...args) {
    super(...args)

    let style = new TextStyle({
      fontFamily: 'Arial',
      fontSize: 36,
      fill: 'white',
      stroke: '#ff3300',
      strokeThickness: 4,
      dropShadow: true,
      dropShadowColor: '#000000',
      dropShadowBlur: 4,
      dropShadowAngle: Math.PI / 6,
      dropShadowDistance: 6
    })
    this.textLoading = new Text(text, style)

    // Add the cat to the stage
    this.addChild(this.textLoading)

    this.life = 0
  }

  tick (delta) {
    this.life += delta / 30 // blend speed
    this.textLoading.text = text + Array(Math.floor(this.life) % 4 + 1).join('.')
  }
}

export default PlayScene
