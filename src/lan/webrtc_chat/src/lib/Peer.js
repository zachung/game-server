import PeerToPeerExchanger from './PeerToPeerExchanger'
import PeerHostSocket from './PeerHostSocket'
import PeerHostPeer from './PeerHostPeer'
import Room from './Room'

class Peer {
  host (onRoomCreated) {
    let room = new Room()
    let onPeerConnected = peer => {
      if (room.peers.length > 0) {
        room.peers.forEach(otherPeer => {
          PeerToPeerExchanger.link(otherPeer, peer)
        })
      }
      room.add(peer)
    }
    PeerHostSocket.host(onRoomCreated, onPeerConnected)

    return room
  }

  client (roomId) {
    let room = new Room()
    let onHostPeerConnected = peer => {
      room.add(peer)
      PeerHostPeer.listen(peer, onHostPeerConnected)
    }
    PeerHostSocket.join(roomId, onHostPeerConnected)

    return room
  }
}

export default Peer
