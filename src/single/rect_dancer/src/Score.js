class Score {
  constructor () {
    this.scoreCurrent = 0
    this.scoreMax = 0
    this.highscore = localStorage.getItem('highscore') || 0
  }

  save () {
    if (this.scoreCurrent > this.highscore) {
      this.highscore = this.scoreCurrent
      localStorage.setItem('highscore', this.highscore)
    }
  }

  clear () {
    this.scoreCurrent = 0
    this.scoreMax = 0
  }

  add (score) {
    this.scoreCurrent += score
    this.scoreMax = Math.max(this.scoreMax, this.scoreCurrent)
  }

  newScore () {
    return this.scoreCurrent === this.scoreMax
  }

  getHighScore () {
    return (Number(this.highscore)).toFixed(2)
  }

  getScore () {
    return (Number(this.scoreCurrent)).toFixed(2)
  }
}

export default Score
