import { Container, Text, TextStyle } from '../lib/PIXI'

import Window from './Window'
import { ABILITY_MOVE, ABILITY_CAMERA, ABILITY_OPERATE, ABILITY_CARRY, ABILITY_PLACE } from '../config/constants'

const ABILITIES_ALL = [
  ABILITY_MOVE,
  ABILITY_CAMERA,
  ABILITY_OPERATE,
  ABILITY_PLACE
]

class PlayerWindow extends Window {
  constructor (opt) {
    super(opt)
    let { player } = opt
    this._opt = opt
    player.on('ability-carry', this.onAbilityCarry.bind(this, player))

    this.abilityTextContainer = new Container()
    this.abilityTextContainer.x = 5
    this.addChild(this.abilityTextContainer)

    this.onAbilityCarry(player)
  }

  onAbilityCarry (player) {
    let i = 0
    let { fontSize = 10 } = this._opt
    let style = new TextStyle({
      fontSize: fontSize,
      fill: 'green',
      lineHeight: fontSize
    })

    // 更新面板數據
    let contianer = this.abilityTextContainer
    contianer.removeChildren()
    ABILITIES_ALL.forEach(abilitySymbol => {
      let ability = player.abilities[abilitySymbol]
      if (ability) {
        let text = new Text(ability.toString(), style)
        text.y = i * (fontSize + 5)

        contianer.addChild(text)

        i++
      }
    })
  }

  toString () {
    return 'window'
  }
}

export default PlayerWindow
