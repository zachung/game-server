class Room {
  constructor (client) {
    let roomId = client.id
    let name = client.id
    client.roomId = roomId
    client.name = name
    this.roomId = roomId
    this.host = client
    this.clients = {}
    this.clients[name] = client
  }

  join (client) {
    let name = client.id
    client.name = name
    client.roomId = this.roomId
    this.host.emit('join', name)
    this.clients[name] = client
  }

  signal (from, to, signal) {
    let isHost = from === this.host.name
    let eventName = isHost ? 'signal-host' : 'signal-join'
    this.clients[to].emit(eventName, {signal, otherName: from})
  }
}

function RoomNotExistException () {
  this.message = 'room not exist'
  this.name = 'RoomNotExistException'
}

class Hosts {
  constructor () {
    this.rooms = {}
  }

  roomList () {
    let list = []
    Object.entries(this.rooms).forEach(([roomId, room]) => {
      list.push({
        roomId,
        count: Object.values(room.clients).length
      })
    })
    return list
  }

  _getRoom (roomId) {
    let room = this.rooms[roomId]
    if (!room) {
      throw new RoomNotExistException()
    }
    return room
  }

  // client or server signal
  signal (client, {signal, name}) {
    client.signal = signal

    let roomId = client.roomId
    let room = this._getRoom(roomId)
    room.signal(client.name, name, signal)
  }

  joinRoom (client, roomId) {
    // let host know this new client want join
    this._getRoom(roomId).join(client)
  }

  createRoom (client) {
    // add record
    let room = new Room(client)
    let roomId = room.roomId
    this.rooms[roomId] = room
    return roomId
  }

  removeRoom (client) {
    let roomId = client.roomId
    delete this.rooms[roomId]
  }
}

function register (io) {
  const hosts = new Hosts()

  io.on('connection', function (client) {
    // join: broadcast for peers which in room
    client.on('join', (roomId, handler) => {
      try {
        hosts.joinRoom(client, roomId)
      } catch (e) {
        handler(e.message)
      }
    })
    // host: create room
    client.on('host', fn => {
      client.isHost = true
      fn(hosts.createRoom(client))
    })

    client.on('signal', (signalData, handler) => {
      try {
        console.log(client.id + ' set signal')
        hosts.signal(client, signalData)
      } catch (e) {
        handler(e.message)
      }
    })

    client.on('event', function (data) {})
    client.on('disconnect', () => {
      if (client.isHost) {
        hosts.removeRoom(client)
      }
    })

    io.clients((error, clients) => {
      if (error) {
        throw error
      }
      console.log('connected: ', clients)
      console.log('rooms:')
      console.log(hosts.roomList())
    })
  })
}

module.exports = {
  register
}
