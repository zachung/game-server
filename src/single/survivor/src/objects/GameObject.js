import { Sprite } from '../lib/PIXI'
import { STATIC } from '../config/constants'
import Messages from '../lib/Messages'

class GameObject extends Sprite {
  get type () { return STATIC }
  say (msg) {
    Messages.add(msg)
    console.log(msg)
  }
}

export default GameObject
