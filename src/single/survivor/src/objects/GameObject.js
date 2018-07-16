import { Sprite } from '../lib/PIXI'
import { STATIC } from '../config/constants'
import messages from '../lib/Messages'

class GameObject extends Sprite {
  get type () { return STATIC }
  say (msg) {
    messages.add(msg)
    console.log(msg)
  }

  tick (delta) {}
}

export default GameObject
