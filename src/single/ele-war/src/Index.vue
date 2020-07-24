<template>
  <div class="container">
    <div id="world" :style="worldStyle">
      <div
        v-for="item in game.stage.map"
        class="tile"
        :style="{ color: item.color, 'background-color': item.bgColor }"
      >
        {{ item.symbol }}
      </div>
    </div>
  </div>
</template>

<script>
import Controller from './lib/Controller'
import world from './data/world'
import Game from './lib/Game'

export default {
  data() {
    return {
      game: new Game()
    }
  },
  computed: {
    worldStyle() {
      return {
        display: 'grid',
        'grid-template-rows': 'repeat(' + this.game.N + ', 1em)',
        'grid-template-columns': 'repeat(' + this.game.N + ', 1em)'
      }
    }
  },
  mounted() {
    this.game.loadWorld(world)

    const player = this.game.addPlayer({ x: 10, y: 10 })
    player.color = '#226cff'
    new Controller(player, { up: 'w', down: 's', left: 'a', right: 'd' })

    const player2 = this.game.addPlayer({ x: 10, y: 12 })
    player2.color = '#6f22ff'
    new Controller(player2)
  }
}
</script>

<style scoped>
#world {
  width: 50em;
  height: 50em;
  overflow: scroll;
}

.tile {
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 1em;
}
</style>
