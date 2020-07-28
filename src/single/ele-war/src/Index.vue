<template>
  <div class="container">
    <div id="world" :style="worldStyle">
      <template v-for="(row, x) in game.stage.map" class="tile">
        <div
          v-for="(item, y) in row"
          class="tile"
          :style="{ color: item.color, 'background-color': item.bgColor }"
          :x="x"
          :y="y"
        >
          {{ item.symbol }}
        </div>
      </template>
    </div>
    <div class="dashboard">
      <div v-if="game.player && game.player.chunk">
        {{ game.player.chunk.chunkName }}
      </div>
      <div v-if="game.player">
        {{ game.player.location.x }}, {{ game.player.location.y }}
      </div>
    </div>
  </div>
</template>

<script>
import Controller from './lib/Controller'
import Game from './lib/Game'

export default {
  data() {
    const viewSize = 50
    const game = new Game({
      viewSize,
      cameraDelta: { x: 16, y: 16 }
    })
    return {
      game: game,
      viewSize
    }
  },
  computed: {
    worldStyle() {
      return {
        display: 'inline-grid',
        'grid-template-rows': 'repeat(' + this.viewSize + ', 1em)',
        'grid-template-columns': 'repeat(' + this.viewSize + ', 1em)'
      }
    }
  },
  mounted() {
    this.game.start().then(player => {
      player.color = '#226cff'
      new Controller(player, { up: 'w', down: 's', left: 'a', right: 'd' })
    })
  }
}
</script>

<style scoped>
.container {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
}
#world {
  width: 50em;
  height: 50em;
  overflow: hidden;
}

.tile {
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 1em;
}
.dashboard {
  display: inline-block;
  padding: .5em;
  border: 5px ridge gray;
}
</style>
