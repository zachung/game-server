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
      .add('images/terrain_atlas.json')
      .add('images/base_out_atlas.json')
      .load(() => this.emit('changeScene', PlayScene, {
        mapFile: 'E0N0',
        position: [1, 1]
      }))
  }

  tick (delta) {
    this.life += delta / 30 // blend speed
    this.textLoading.text = text + Array(Math.floor(this.life) % 4 + 1).join('.')
  }
}

export default LoadingScene
