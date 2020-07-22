<template>
  <div class="mini-table">
    &nbsp;
    <card
      v-for="(card, sit) in cards"
      :key="card.code"
      :card="card"
      :class="{ winner: sit === winner, lead: sit === lead }"
    ></card>
  </div>
</template>

<script>
import Card from './Card.vue'

const round = sit => sit % 4

export default {
  components: {
    Card
  },
  props: {
    trick: Object
  },
  computed: {
    cards() {
      const _cards = []
      for (let i = 0; i < 4; i++) {
        _cards[round(i + this.trick.start)] = this.trick._cards[i]
      }
      return _cards
    },
    lead() {
      return this.trick.start
    },
    winner() {
      return this.trick.winner
    }
  }
}
</script>

<style scoped>
.mini-table {
  display: inline-grid;
  grid-template-columns: repeat(3, 1fr);
}
.mini-table .card {
  position: relative;
}
.mini-table .card:nth-child(1) {
  grid-column-start: 2;
  grid-column-end: 3;
  grid-row-start: 3;
  grid-row-end: 4;
}
.mini-table .card:nth-child(2) {
  grid-column-start: 1;
  grid-column-end: 2;
  grid-row-start: 2;
  grid-row-end: 3;
}
.mini-table .card:nth-child(3) {
  grid-column-start: 2;
  grid-column-end: 3;
}
.mini-table .card:nth-child(4) {
  grid-column-start: 3;
  grid-column-end: 4;
  grid-row-start: 2;
  grid-row-end: 3;
}
.winner {
  border: 1px solid red;
}
.lead:before {
  content: '';
  position: absolute;
  width: 0;
  height: 0;
  border-left: 5px solid red;
  border-right: 5px solid transparent;
  border-top: 5px solid transparent;
  border-bottom: 5px solid transparent;
  left: -7px;
}
</style>
