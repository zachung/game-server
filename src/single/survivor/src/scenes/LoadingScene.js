import { Text, TextStyle, loader } from '../lib/PIXI'
import Scene from '../lib/Scene'
import PlayScene from './PlayScene'

let text = 'loading'

class LoadingScene extends Scene {
  constructor () {
    super()

    this.life = 0
  }

  create () {
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

    // load an image and run the `setup` function when it's done
    loader
      .add('images/cat.png')
      .add('images/town_tiles.json')
      .add('images/下載.jpeg')
      .add('images/142441.jpeg')
      .add('images/2ea4c902-23fd-4e89-b072-c50ad931ab8b.jpg')
      .load(() => this.emit('changeScene', PlayScene, {
        map: 'E0S0'
      }))
  }

  tick (delta) {
    this.life += delta / 30 // blend speed
    this.textLoading.text = text + Array(Math.floor(this.life) % 4 + 1).join('.')
  }
}

export default LoadingScene
