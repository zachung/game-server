const Ball = require('./ball')

class Cursor extends Ball {
  constructor (options) {
    const defaults = {
      width: 40,
      height: 40,
      image: 'cursor',
      canBuildHere: true
    }
    const populated = Object.assign(defaults, options)
    super(populated)
  }
  getSelectedBuild () {
    return this.build
  }
  clearSelected () {
    delete this.build
    this.canBuildHere = true
  }
  setSelectedBuild (build) {
    this.build = build
  }
  render (app, deltaPoint = { x: 0, y: 0 }) {
    if (this.build) {
      this.build.setCenter(this.x, this.y)
      this.build.render(app, deltaPoint)
      if (!this.canBuildHere) {
        let lineRadius = 40
        app.layer
          .save()
          .lineWidth(5)
          .strokeStyle('#F00')
          .strokeLine(this.x - lineRadius, this.y - lineRadius, this.x + lineRadius, this.y + lineRadius)
          .strokeLine(this.x + lineRadius, this.y - lineRadius, this.x - lineRadius, this.y + lineRadius)
          .restore()
      }
    } else {
      super.renderImage(app, deltaPoint)
    }
  }
}

module.exports = Cursor
