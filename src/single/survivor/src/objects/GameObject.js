import { Sprite } from '../lib/PIXI'
import { STATIC } from '../config/constants'

class GameObject extends Sprite {
  get type () { return STATIC }
}

export default GameObject
