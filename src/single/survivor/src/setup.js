import PlayScene from './scenes/PlayScene'

let scene

export function setup (app) {
  let playScene = new PlayScene(app)

  playScene.show()

  // Set the game state
  scene = playScene

  // Start the game loop
  app.ticker.add(delta => gameLoop(delta))
}

function gameLoop (delta) {
  // Update the current game state:
  scene.tick(delta)
}
