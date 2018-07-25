/**
 * peer 交換器，藉由 hostPeer 實現其他兩個 peer 的連結
 */
class PeerToPeerExchanger {
  static link (fromPeer, toPeer) {
    let fromName = fromPeer.otherName
    let toName = toPeer.otherName
    let eventNameJoin = 'peer-signal-join' + fromName
    let eventNameHost = 'peer-signal-host'
    console.log('try link', [fromName, toName].join(', '))

    let signalHostHandler = ({signal, name}) => {
      toPeer.send(eventNameHost, {signal, otherName: fromName})
      fromPeer.off(eventNameHost, signalHostHandler)
    }
    let signalJoinHandler = ({signal, name}) => {
      fromPeer.send('peer-signal-join', {signal, otherName: toName})
      toPeer.off(eventNameJoin, signalJoinHandler)
    }
    fromPeer.on(eventNameHost, signalHostHandler)
    // FIXME:
    toPeer.on(eventNameJoin, signalJoinHandler)

    fromPeer.send('peer-join', toName)
  }
}

export default PeerToPeerExchanger
