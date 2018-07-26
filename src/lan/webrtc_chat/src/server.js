function guidGenerator () {
  return (((1 + Math.random()) * 10000) | 0).toString(10).substring(1)
}

class Room {
  constructor (client, myName) {
    this.roomId = client.id
    this.host = client
    this.clients = {}
    this._decorateClient(client, myName)
  }

  join (client, myName) {
    this._decorateClient(client, myName)
    this.host.emit('join', client.myName)
  }

  _decorateClient (client, myName) {
    // 注意名稱衝突
    if (this.isNameDuplicated(myName)) {
      myName += '#' + guidGenerator()
    }
    client.myName = myName
    client.roomId = this.roomId
    this.clients[myName] = client
  }

  isNameDuplicated (myName) {
    return Object.values(this.clients).some(client => client.myName === myName)
  }

  signal (from, to, signal) {
    let isHost = from === this.host.myName
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
    room.signal(client.myName, name, signal)
  }

  joinRoom (client, myName, roomId) {
    // let host know this new client want join
    this._getRoom(roomId).join(client, myName)
  }

  createRoom (client, myName) {
    // add record
    let room = new Room(client, myName)
    let roomId = room.roomId
    this.rooms[roomId] = room
    return roomId
  }

  removeRoom (client) {
    let roomId = client.roomId
    delete this.rooms[roomId]
  }
}

const hosts = new Hosts()

let isRegistered = false

function register (io) {
  if (isRegistered) {
    return
  }
  isRegistered = true
  io.on('connection', function (client) {
    // join: broadcast for peers which in room
    client.on('join', (roomId, myName, cb) => {
      try {
        hosts.joinRoom(client, myName, roomId)
        cb(null, client.myName)
      } catch (e) {
        cb(e.message)
      }
    })
    // host: create room
    client.on('host', (myName, cb) => {
      client.isHost = true
      cb(hosts.createRoom(client, myName))
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
