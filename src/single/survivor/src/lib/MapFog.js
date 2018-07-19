import { Container, display, BLEND_MODES, Sprite } from './PIXI'

class MapFog extends Container {
  constructor () {
    super()
    let lighting = new display.Layer()
    lighting.on('display', function (element) {
      element.blendMode = BLEND_MODES.ADD
    })
    lighting.useRenderTexture = true
    lighting.clearColor = [0, 0, 0, 1] // ambient gray

    this.addChild(lighting)

    var lightingSprite = new Sprite(lighting.getRenderTexture())
    lightingSprite.blendMode = BLEND_MODES.MULTIPLY

    this.addChild(lightingSprite)

    this.lighting = lighting
  }

  enable (map) {
    this.lighting.clearColor = [0, 0, 0, 1]
    map.map.lighting = this.lighting
  }

  // 消除迷霧
  disable () {
    this.lighting.clearColor = [1, 1, 1, 1]
  }
}

export default MapFog
