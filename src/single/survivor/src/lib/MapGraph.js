import createGraph from 'ngraph.graph'
import path from 'ngraph.path'
import GameObjects from './GameObjects'

class MapGraph {
  constructor (scale = 1) {
    this._graph = createGraph()
    this._finder = path.aStar(this._graph, {
      // We tell our pathfinder what should it use as a distance function:
      distance (fromNode, toNode, link) {
        return fromNode.data.weight + toNode.data.weight + 1
      }
    })
  }

  addObject (o, i, j) {
    let graph = this._graph

    let selfName = [i, j].join(',')
    let node = graph.getNode(selfName)
    if (!node) {
      node = graph.addNode(selfName, new GameObjects(o))
    } else {
      node.data.push(o)
    }
    let link = (selfNode, otherNode) => {
      if (!selfNode || !otherNode || graph.getLink(selfNode.id, otherNode.id)) {
        return
      }
      let weight = selfNode.data.weight + otherNode.data.weight
      if (weight === 0) {
        graph.addLink(selfNode.id, otherNode.id)
      }
    }
    if (node.data.weight !== 0) {
      // 此點不通，移除所有連結
      graph.forEachLinkedNode(selfName, function (linkedNode, link) {
        graph.removeLink(link)
      })
      return
    }
    link(node, graph.getNode([i - 1, j].join(',')))
    link(node, graph.getNode([i, j - 1].join(',')))
    link(graph.getNode([i + 1, j].join(',')), node)
    link(graph.getNode([i, j + 1].join(',')), node)
  }

  find (from, to) {
    return this._finder.find(from, to)
  }

  beginUpdate () {
    this._graph.beginUpdate()
  }

  endUpdate () {
    this._graph.endUpdate()
  }
}

export default MapGraph
