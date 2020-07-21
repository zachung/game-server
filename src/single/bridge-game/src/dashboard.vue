<template>
  <div class="panel">
    <div class="message">{{ message }}</div>
    <button @click="restart">Restart</button>
    <ol>
      <li v-for="trick in game.table.history">
        <span>start: {{ Sits[trick.start] }}</span>
        <card
          v-for="card in trick.cards()"
          :key="card.code"
          :card="card"
        ></card>
        <span>winner: {{ Sits[game.table.checkWinner(trick)] }}</span>
      </li>
    </ol>
  </div>
</template>

<script>
import { Sits } from './js/Constant'
import Card from './card.vue'

export default {
  components: {
    Card
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
      game.distribute()
    }
  }
}
</script>

<style scoped></style>
