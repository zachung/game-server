import { Blocks } from '../data/Symbols'
import Item from './Item'

const newItem = (symbol, x, y) => {
  const item = new Item(symbol)
  item.location = { x, y }
  return item
}

class ChunkReader {
  load (world, cb) {
    return this.getJSON('world/' + world + '.json')
      .then(world => {
        // load items
        const items = world.items
        for (const id in items) {
          if (!items.hasOwnProperty(id)) {
            continue
          }
          items[id].forEach(item => {
            cb(newItem(Blocks[id], ...item))
          })
        }
      })
  }

  getJSON (url) {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest()
      xhr.open('GET', url, true)
      xhr.responseType = 'json'
      xhr.onload = () => {
        const status = xhr.status
        if (status === 200) {
          resolve(xhr.response)
        } else {
          reject(status, xhr.response)
        }
      }
      xhr.send()
    })
  }
}

export default ChunkReader
