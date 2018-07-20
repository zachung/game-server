import { Container, Text, TextStyle } from '../lib/PIXI'
import ValueBar from './ValueBar'

import Window from './Window'
import { ABILITY_MOVE, ABILITY_CAMERA, ABILITY_HEALTH, ABILITY_MANA } from '../config/constants'

const floor = Math.floor

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

    this.healthBar = this.renderBar({x: 5, y: 5, color: 0xD23200})
    this.manaBar = this.renderBar({x: 5, y: 17, color: 0x0032D2})
    this.renderAbility({x: 5, y: 32})

    this.onAbilityCarry(player)

    player.on('ability-carry', this.onAbilityCarry.bind(this, player))
    player.on('health-change', this.onHealthChange.bind(this, player))
    player.on('mana-change', this.onManaChange.bind(this, player))
  }

  renderAbility ({x, y}) {
    let abilityTextContainer = new Container()
    abilityTextContainer.position.set(x, y)
    this.addChild(abilityTextContainer)
    this.abilityTextContainer = abilityTextContainer
  }

  renderBar ({x, y, color}) {
    let {width} = this._opt
    width /= 2
    let height = 10
    let container = new Container()
    container.position.set(x, y)
    let bar = new ValueBar({width, height, color})
    let text = new Text('(10/20)', this._getTextStyle())
    text.x = width + 3
    text.y = -3

    container.addChild(bar)
    container.addChild(text)
    this.addChild(container)

    container.bar = bar
    container.text = text

    return container
  }

  _getTextStyle () {
    let { fontSize = 10 } = this._opt
    return new TextStyle({
      fontSize: fontSize,
      fill: 'green',
      lineHeight: fontSize
    })
  }

  onAbilityCarry (player) {
    let i = 0

    // 更新面板數據
    let contianer = this.abilityTextContainer
    contianer.removeChildren()
    ABILITIES_ALL.forEach(abilitySymbol => {
      let ability = player.abilities[abilitySymbol]
      if (ability) {
        let text = new Text(ability.toString(), this._getTextStyle())
        text.y = i * (text.height)

        contianer.addChild(text)

        i++
      }
    })
  }

  onHealthChange (player) {
    this._updateValueBar(this.healthBar, player[ABILITY_HEALTH])
  }

  onManaChange (player) {
    this._updateValueBar(this.manaBar, player[ABILITY_MANA])
  }

  _updateValueBar (panel, ability) {
    if (!ability) {
      panel.visible = false
      return
    }
    if (!panel.visible) {
      panel.visible = true
    }

    panel.text.text = [
      '(', floor(ability.value), '/', floor(ability.valueMax), ')'
    ].join('')
    panel.bar.emit('value-change', ability.value / ability.valueMax)
  }

  toString () {
    return 'window'
  }
}

export default PlayerWindow
