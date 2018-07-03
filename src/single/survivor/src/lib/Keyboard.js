import keyboardJS from 'keyboardjs'

class Keyboard {
  constructor () {
    this.isEnabled = false
    this._pressedKeys = []
    this._releasedKeys = []
    this._downKeys = []

    this._hotKeys = []
    this._preventDefaultKeys = []
  }

  enable () {
    if (!this.isEnabled) {
      this.isEnabled = true
      this._enableEvents()
    }
  }

  _enableEvents () {
    window.addEventListener('keydown', this._onKeyDown.bind(this), true)
    window.addEventListener('keyup', this._onKeyUp.bind(this), true)
  }

  _onKeyDown (evt) {
    let key = evt.which || evt.keyCode
    if (this._preventDefaultKeys[key]) {
      evt.preventDefault()
    }

    if (!this.isDown(key)) {
      this._downKeys[key] = true
      this._pressedKeys[key] = true
      this.emit('pressed', key)
    }
  }

  _onKeyUp (evt) {
    let key = evt.which || evt.keyCode
    if (this._preventDefaultKeys[key]) {
      evt.preventDefault()
    }

    if (this.isDown(key)) {
      this._pressedKeys[key] = false
      this._releasedKeys[key] = true

      delete this._downKeys[key]
      this.emit('released', key)
    }
  }

  isDown (key) {
    return !!this._downKeys[key]
  }

  isPressed (key) {
    return !!this._pressedKeys[key]
  }

  isReleased (key) {
    return !!this._releasedKeys[key]
  }
}

export default Keyboard
