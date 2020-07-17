<template>
  <div>
    <div>
      <label>Table</label>
      <card v-for="card in table.cards()" :card="card"></card>
      <div>waiting for {{ table.waitingSit() }}</div>
    </div>
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

<style scoped></style>
