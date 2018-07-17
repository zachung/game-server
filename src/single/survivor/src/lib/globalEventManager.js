class GlobalEventManager {
  setInteraction (interaction) {
    this.interaction = interaction
  }

  on (eventName, handler) {
    this.interaction.on(eventName, handler)
  }

  off (eventName, handler) {
    this.interaction.off(eventName, handler)
  }

  emit (eventName, ...args) {
    this.interaction.emit(eventName, ...args)
  }
}

export default new GlobalEventManager()
