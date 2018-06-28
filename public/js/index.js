const socket = io('/lobby')
socket
  .on('user count', playerCount => {
    console.log(playerCount)
    document.querySelectorAll('.span-game-player-count').forEach(e => {
      console.log(playerCount)
	  let gameName = e.dataset.gameName
	  e.innerHTML = playerCount[gameName] || 0
    })
  })
  .on('user leave', nsp => {
    let e = document.querySelector('.span-game-player-count[data-game-name="' + nsp + '"]')
    if (e) {
      e.innerHTML = e.innerHTML - 1
    }
  })
