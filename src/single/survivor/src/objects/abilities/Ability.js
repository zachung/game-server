const type = Symbol('ability')

class Ability {
  get type () { return type }

  getSameTypeAbility (owner) {
    return owner.abilities[this.type]
  }

  // 是否需置換
  hasToReplace (owner, abilityNew) {
    let abilityOld = this.getSameTypeAbility(owner)
    return !abilityOld || abilityNew.isBetter(abilityOld)
  }

  // 新舊比較
  isBetter (other) {
    return true
  }

  // 配備此技能
  carryBy (owner) {
    let abilityOld = this.getSameTypeAbility(owner)
    if (abilityOld) {
      // first get this type ability
      abilityOld.replacedBy(this, owner)
    }
    owner.abilities[this.type] = this
  }

  replacedBy (other, owner) {}

  dropBy (owner) {
    delete owner.abilities[this.type]
  }

  toString () {
    return 'plz extend this class'
  }

  serialize () {
    return {}
  }
}

export default Ability
