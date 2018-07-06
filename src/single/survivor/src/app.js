import Application from './lib/Application'
import LoadingScene from './scenes/LoadingScene'

// Create a Pixi Application
let app = new Application({
  width: 256,
  height: 256,
  roundPixels: true,
  autoResize: true,
  resolution: 1,
  autoStart: false
})

app.renderer.view.style.position = 'absolute'
app.renderer.view.style.display = 'block'
app.renderer.resize(window.innerWidth, window.innerHeight)

// Add the canvas that Pixi automatically created for you to the HTML document
document.body.appendChild(app.view)

app.changeStage()
app.start()
app.changeScene(LoadingScene)
