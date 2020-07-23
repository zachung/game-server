<template>
  <div class="container">
    <div id="world" :style="worldStyle">
      <template v-for="row in world">
        <div v-for="cell in row" class="tile">
          {{ cell }}
        </div>
      </template>
    </div>
  </div>
</template>

<script>
const empty = '\u25A2'
const wall = '\u25A6'
const N = 100
const world = []
for (let r = 0; r < N; r++) {
  world[r] = []
  for (let c = 0; c < N; c++) {
    world[r][c] = empty
  }
}

world[20][20] = wall

export default {
  data() {
    return {
      world,
      tileCount: N
    }
  },
  computed: {
    worldStyle() {
      return {
        display: 'grid',
        'grid-template-rows': 'repeat(' + N + ', 1em)',
        'grid-template-columns': 'repeat(' + N + ', 1em)'
      }
    }
  },
  mounted() {}
}
</script>

<style scoped>
.tile {
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 1em;
}
</style>