import { resources } from '../lib/PIXI'

class Texture {
  static get TerrainAtlas () {
    return resources['images/terrain_atlas.json']
  }
  static get BaseOutAtlas () {
    return resources['images/base_out_atlas.json']
  }
  static get Rock () {
    return Texture.TerrainAtlas.textures['rock.png']
  }
  static get Wall () {
    return Texture.TerrainAtlas.textures['wall.png']
  }
  static get Grass () {
    return Texture.TerrainAtlas.textures['grass.png']
  }
  static get Door () {
    return Texture.BaseOutAtlas.textures['door.png']
  }
  static get Torch () {
    return Texture.BaseOutAtlas.textures['torch.png']
  }
  static get Treasure () {
    return Texture.BaseOutAtlas.textures['treasure.png']
  }
}

export default Texture
