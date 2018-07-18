import { Container, Text, TextStyle } from '../lib/PIXI'
import ValueBar from './ValueBar'

import Window from './Window'
import { ABILITY_MOVE, ABILITY_CAMERA, ABILITY_HEALTH } from '../config/constants'

const ABILITIES_ALL = [
  ABILITY_MOVE,
  ABILITY_CAMERA,
  ABILITY_HEALTH
]

class PlayerWindow extends Window {
  constructor (opt) {
    super(opt)
    let { player } = opt
    this._opt = opt

    this.renderHealthBar({x: 5, y: 5})
    this.renderAbility({x: 5, y: 20})

    this.onAbilityCarry(player)

    player.on('ability-carry', this.onAbilityCarry.bind(this, player))
    player.on('health-change', this.onHealthChange.bind(this, player))
  }

  renderAbility ({x, y}) {
    let abilityTextContainer = new Container()
    abilityTextContainer.position.set(x, y)
    this.addChild(abilityTextContainer)
    this.abilityTextContainer = abilityTextContainer
  }

  renderHealthBar ({x, y}) {
    let {width} = this._opt
    width /= 2
    let height = 10
    let color = 0xD23200
    let healthBar = new ValueBar({x, y, width, height, color})

    this.addChild(healthBar)

    this.healthBar = healthBar
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

  onHealthChange (player) {
    let healthAbility = player[ABILITY_HEALTH]
    if (!healthAbility) {
      this.healthBar.visible = false
      return
    }
    if (!this.healthBar.visible) {
      this.healthBar.visible = true
    }
    this.healthBar.emit('value-change', healthAbility.hp / healthAbility.hpMax)
  }

  toString () {
    return 'window'
  }
}

export default PlayerWindow
