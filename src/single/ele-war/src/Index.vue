<template>
  <div class="container">
    <div id="world" :style="worldStyle">
      <template v-for="(row, x) in game.world.stage.map" class="tile">
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
      <div v-if="game.world.stage.chunk">
        {{ game.world.stage.chunk.chunkName }}
      </div>
      <div v-if="game.player">{{ game.player.location.x }}, {{ game.player.location.y }}</div>
    </div>
  </div>
</template>

<script>
import Controller from './lib/Controller'
import Game from './lib/Game'

export default {
  data() {
    const game = new Game()
    return {
      game: game
    }
  },
  computed: {
    worldStyle() {
      return {
        display: 'inline-grid',
        'grid-template-rows': 'repeat(32, 1em)',
        'grid-template-columns': 'repeat(32, 1em)'
      }
    }
  },
  mounted() {
    this.game.start().then(player => {
      player.color = '#226cff'
      new Controller(player, { up: 'w', down: 's', left: 'a', right: 'd' })
    })
    // const up = 'up',
    //   down = 'down',
    //   right = 'right',
    //   left = 'left'
    // hotkeys(left, () => {
    //   this.game.loc.x -= 1
    // })
    // hotkeys(up, () => {
    //   this.game.loc.y -= 1
    // })
    // hotkeys(right, () => {
    //   this.game.loc.x += 1
    // })
    // hotkeys(down, () => {
    //   this.game.loc.y += 1
    // })
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
  overflow: scroll;
}

.tile {
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 1em;
}
.dashboard {
  display: inline-block;
}
</style>
