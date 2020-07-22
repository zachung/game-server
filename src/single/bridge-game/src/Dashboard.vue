<template>
  <div class="panel">
    <div class="message">{{ message }}</div>
    <button @click="restart">Restart</button>
    <ol>
      <li v-for="trick in game.table.history" class="history-trick">
        <mini-desktop :trick="trick"></mini-desktop>
      </li>
    </ol>
  </div>
</template>

<script>
import { Sits } from './js/Constant'
import MiniDesktop from './MiniDesktop.vue'

export default {
  components: {
    MiniDesktop
  },
  props: {
    game: Object,
    message: String
  },
  data() {
    return {
      Sits
    }
  },
  methods: {
    restart() {
      this.game.distribute()
    }
  }
}
</script>

<style scoped>
.message {
  color: red;
}
.history-trick {
  padding-bottom: 5px;
  border-bottom: 1px solid gray;
}
</style>
