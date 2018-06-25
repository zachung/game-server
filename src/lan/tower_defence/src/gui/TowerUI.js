const Window = require('./Window')

const btnH = 30

const getNumber = (theNumber) => {
  if (theNumber > 0) {
    return '+' + theNumber
  } else {
    return theNumber.toString()
  }
}

class TowerUI extends Window {
  constructor (options) {
    const defaults = {
      width: 300,
      height: 400,
      noExpendBtn: true,
      backgroundColor: 'rgba(255, 255, 255, 0.5)',
      strokeColor: 'rgba(255, 255, 255, 0)'
    }
    const populated = Object.assign(defaults, options)
    super(populated)
  }
  /* set UI info for tower */
  active (tower) {
    let center = tower.center
    this.setCenter(center.x, center.y)
    this.tower = tower
  }
  onMousedown (point) {
    if (point.button !== 'left') {
      return true
    }
    if (this.tower) {
      return super.onMousedown(point)
    }
  }
  inactive () {
    delete this.tower
  }
  render (app, deltaPoint) {
    if (!this.tower) {
      return
    }
    this.deltaPoint = deltaPoint
    super.render.apply(this, arguments)
  }
  renderWindow (app, deltaPoint) {
    let tower = this.tower
    this.renderTowerInfo(app, deltaPoint)
    if (tower.hasUpgradeOption()) {
      this.renderUpgrade(app, deltaPoint)
    }
    this.renderSellBtn(app, deltaPoint)
  }
  mousedownInWindow (point) {
    // sell tower
    if (TowerUI.isInRect(point, this.areaOfSellBtn)) {
      this.tower.trigger('sell')
      this.inactive()
      return false
    } else if (TowerUI.isInRect(point, this.areaOfUpgradeBtn)) {
      this.tower.upgrade()
    }
  }
  renderTowerInfo (app, deltaPoint) {
    let areaOfTowerInfo = this.areaOfTowerInfo
    areaOfTowerInfo.x += deltaPoint.x
    areaOfTowerInfo.y += deltaPoint.y
    let tower = this.tower
    let x = areaOfTowerInfo.x
    let currentY = areaOfTowerInfo.y
    let textArray = [
      'damage: ' + tower.damage.toFixed(2),
      'radius: ' + tower.attackDistance.toFixed(2),
      'cd: ' + tower.colddown.toFixed(2)
    ]
    textArray.forEach(text => {
      app.layer
        .fillStyle('rgba(0, 0, 0, 0.5)')
        .fillRect(x, currentY, areaOfTowerInfo.width, btnH)
        .font('30px Verdana')
        .fillStyle('#FFD700')
        .fillText(text, x, currentY += 30)
    })
  }
  get areaOfTowerInfo () {
    let renderArea = this.renderArea
    return {
      x: renderArea.x,
      y: renderArea.y,
      width: renderArea.width,
      height: btnH * 3
    }
  }
  renderUpgrade (app, deltaPoint) {
    let areaOfUpgradeBtn = this.areaOfUpgradeBtn
    areaOfUpgradeBtn.x += deltaPoint.x
    areaOfUpgradeBtn.y += deltaPoint.y
    let upgradeOptions = this.tower.upgradeOptions
    let currentY = areaOfUpgradeBtn.y

    // only show 3 upgrade item
    upgradeOptions.slice(0, 3).forEach((option, index) => {
      app.layer
        .fillStyle('rgba(0, 0, 0, 0.5)')
        .fillRect(areaOfUpgradeBtn.x, currentY, areaOfUpgradeBtn.width, areaOfUpgradeBtn.height)
        .font('30px Verdana')
        .fillStyle('#FFD700')
        .fillText('↑ ' + option.name + '($' + option.cost + ')', areaOfUpgradeBtn.x, currentY + 30)
      if (index === 0) {
        option.attrs.forEach(attr => {
          currentY += btnH
          app.layer
            .fillStyle('rgba(0, 0, 0, 0.5)')
            .fillRect(areaOfUpgradeBtn.x, currentY, areaOfUpgradeBtn.width, areaOfUpgradeBtn.height)
            .font('30px Verdana')
            .fillStyle('#DDA700')
            .fillText('  ' + getNumber(attr.value) + ' ' + attr.type, areaOfUpgradeBtn.x, currentY + 30)
        })
      } else {
        // can NOT upgrade
        app.layer
          .fillStyle('rgba(0, 0, 0, 0.5)')
          .fillRect(areaOfUpgradeBtn.x, currentY, areaOfUpgradeBtn.width, areaOfUpgradeBtn.height)
      }
      currentY += btnH
    })
  }
  get areaOfUpgradeBtn () {
    let areaOfTowerInfo = this.areaOfTowerInfo
    return {
      x: areaOfTowerInfo.x,
      y: areaOfTowerInfo.y + areaOfTowerInfo.height + btnH / 2,
      width: areaOfTowerInfo.width,
      height: btnH
    }
  }
  renderSellBtn (app, deltaPoint) {
    let areaOfSellBtn = this.areaOfSellBtn
    areaOfSellBtn.x += deltaPoint.x
    areaOfSellBtn.y += deltaPoint.y
    app.layer
      .fillStyle('rgba(0, 0, 0, 0.5)')
      .fillRect(areaOfSellBtn.x, areaOfSellBtn.y, areaOfSellBtn.width, areaOfSellBtn.height)
      .font('30px Verdana')
      .fillStyle('#FFD700')
      .fillText('sell($' + this.tower.sellIncome.toFixed(0) + ')', areaOfSellBtn.x, areaOfSellBtn.y + 30)
  }
  get areaOfSellBtn () {
    let renderArea = this.renderArea
    return {
      x: renderArea.x,
      y: renderArea.y + renderArea.height - btnH,
      width: renderArea.width,
      height: btnH
    }
  }
}

module.exports = TowerUI
