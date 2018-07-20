import { Text, TextStyle } from '../lib/PIXI'
import Window from './Window'

class Button extends Window {
  constructor (opt) {
    super(opt)

    let { width, height, fontSize = height * 0.5, literal = '', on } = opt

    this._draw(fontSize, width, height)
    this.setText(literal)
    if (on) {
      this.listen(on)
    }
  }

  _draw (fontSize, width, height) {
    let style = new TextStyle({
      fontFamily: 'Arial',
      fontSize: fontSize,
      fill: '#773300'
    })
    let text = new Text('', style)
    text.anchor.set(0.5, 0.5)
    text.position.set(width / 2, height / 2)
    this.addChild(text)
    this._text = text
  }

  setText (text) {
    this._text.text = text
  }

  listen (f) {
    this.interactive = true
    this.on('click', f)
    this.on('tap', f)
  }

  toString () {
    return 'Button'
  }
}

export default Button
