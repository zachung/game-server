import { Application, loader } from './pixi'
import { setup } from './setup'
import LoadingScene from './scenes/LoadingScene'

// Create a Pixi Application
let app = new Application({
  width: 256,
  height: 256,
  antialias: true,
  transparent: false,
  resolution: 1
})

app.renderer.view.style.position = 'absolute'
app.renderer.view.style.display = 'block'
app.renderer.autoResize = true
app.renderer.resize(window.innerWidth, window.innerHeight)

// Add the canvas that Pixi automatically created for you to the HTML document
document.body.appendChild(app.view)

let loadingScene = new LoadingScene(app)
loadingScene.show()

// load an image and run the `setup` function when it's done
loader
  .add('images/cat.png')
  .add('images/下載.jpeg')
  .add('images/142441.jpeg')
  .add('images/2ea4c902-23fd-4e89-b072-c50ad931ab8b.jpeg')
  .on('progress', () => {
    loadingScene.tick(31)
  })
  .load(() => {
    loadingScene.dismiss()
    setup(app)
  })
