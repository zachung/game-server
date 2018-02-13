class SocketCommand {
  constructor(namespace) {
    this.socket = io(namespace);
    this.queue = [];
  }
  add(eventName, callback) {
    var command = this;
    command.socket.on(eventName, function() {
      command.queue.push({
        eventName: "on " + eventName,
        f: () => {
          // let callback has socket.id
          callback.apply(command.socket, arguments);
        }
      });
    });
  }
  emit(eventName, data) {
    var command = this;
    command.queue.push({
      eventName: "emit " + eventName,
      f: () => {
        command.socket.emit(eventName, data);
      }
    });
  }
  executeAll() {
    // message queue
    for (var i = this.queue.length - 1; i >= 0; --i) {
      let task = this.queue[i];
      if (!task.executeTime) {
        task.f();
        task.executeTime = new Date();
      } else {
        if (task.executeTime.getTime() + 1000*10 < (new Date()).getTime()) {
          this.queue.splice(i, 1); // Remove even numbers
        }
      }
    }
  }
  getList() {
    return this.queue;
  }
}

module.exports = SocketCommand;