import { resources } from '../lib/PIXI'

const Texture = {
  get TerrainAtlas () {
    return resources['images/terrain_atlas.json']
  },
  get BaseOutAtlas () {
    return resources['images/base_out_atlas.json']
  },

  get Air () {
    return Texture.TerrainAtlas.textures['empty.png']
  },
  get Grass () {
    return Texture.TerrainAtlas.textures['grass.png']
  },
  get Ground () {
    return Texture.TerrainAtlas.textures['brick-tile.png']
  },

  get Wall () {
    return Texture.TerrainAtlas.textures['wall.png']
  },
  get IronFence () {
    return Texture.BaseOutAtlas.textures['iron-fence.png']
  },
  get Root () {
    return Texture.TerrainAtlas.textures['root.png']
  },
  get Tree () {
    return Texture.TerrainAtlas.textures['tree.png']
  },

  get Treasure () {
    return Texture.BaseOutAtlas.textures['treasure.png']
  },
  get Door () {
    return Texture.BaseOutAtlas.textures['iron-fence.png']
  },
  get Torch () {
    return Texture.BaseOutAtlas.textures['torch.png']
  },
  get GrassDecorate1 () {
    return Texture.TerrainAtlas.textures['grass-decorate-1.png']
  },
  get Bullet () {
    return Texture.BaseOutAtlas.textures['bullet.png']
  },

  get Rock () {
    return Texture.TerrainAtlas.textures['rock.png']
  }
}

export default Texture
