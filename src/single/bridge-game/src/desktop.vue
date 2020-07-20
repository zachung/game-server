<template>
  <div class="desktop">
    <div>
      <label>Table</label>
      <card v-for="card in table.cards()" :key="card" :card="card"></card>
    </div>
    <ol>
      <li v-for="trick in table.history">
        <span>start: {{ trick.start }}</span>
        <card v-for="card in trick.cards()" :key="card" :card="card"></card>
        <span>winner: {{ table.checkWinner(trick) }}</span>
      </li>
    </ol>
  </div>
</template>

<script>
import Card from './card.vue'

export default {
  components: {
    Card
  },
  props: {
    table: Object
  }
}
</script>

<style scoped>
.desktop {
  border: 1px solid cadetblue;
  border-radius: 5px;
  padding: 5px;
  margin: 5px;
}
</style>
