const Notification = window.Notification

class NotifyHelper {
  // local to remote
  static notify (option) {
    // Let's check if the browser supports notifications
    if (!('Notification' in window)) {
      console.log('This browser does not support system notifications')
      return
    }
    if (Notification.permission === 'granted') {
      NotifyHelper._notify(option)
    } else if (Notification.permission !== 'denied') {
      NotifyHelper.requestGrant(option)
    }
  }

  static requestGrant (option) {
    Notification.requestPermission(function (permission) {
      // If the user accepts, let's create a notification
      if (permission === 'granted') {
        return new Notification(option)
      }
    })
  }

  static _notify ({ title, body }) {
    const n = new Notification(title, { body })
    n.onshow = () => {
      setTimeout(n.close, 5000)
    }
  }
}

export default NotifyHelper
