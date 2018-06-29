import Application from './lib/Application'
import LoadingScene from './scenes/LoadingScene'

// Create a Pixi Application
let app = new Application({
  width: 256,
  height: 256,
  antialias: true,
  transparent: false,
  resolution: 1,
  autoStart: false
})

app.renderer.view.style.position = 'absolute'
app.renderer.view.style.display = 'block'
app.renderer.autoResize = true
app.renderer.resize(window.innerWidth, window.innerHeight)

// Add the canvas that Pixi automatically created for you to the HTML document
document.body.appendChild(app.view)

app.start()
app.changeScene(LoadingScene)
