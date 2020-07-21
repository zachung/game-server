<template>
  <div class="table">
    <label>Table</label>
    <div class="desktop">
      <div class="north-table">
        <card :card="north" v-if="north"></card>
        <span v-else>&nbsp;</span>
      </div>
      <div class="west-table">
        <card :card="west" v-if="west"></card>
        <span v-else>&nbsp;</span>
      </div>
      <div class="east-table">
        <card :card="east" v-if="east"></card>
        <span v-else>&nbsp;</span>
      </div>
      <div class="south-table">
        <card :card="south" v-if="south"></card>
        <span v-else>&nbsp;</span>
      </div>
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
  },
  computed: {
    cards() {
      return this.table.cards()
    },
    south() {
      return this.cards[0]
    },
    west() {
      return this.cards[1]
    },
    north() {
      return this.cards[2]
    },
    east() {
      return this.cards[3]
    }
  }
}
</script>

<style scoped>
.table {
  border: 1px solid cadetblue;
  border-radius: 5px;
  padding: 5px;
  margin: 5px;
}
.desktop {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
}
.north-table {
  grid-column-start: 2;
  grid-column-end: 3;
}
.west-table {
  grid-column-start: 1;
  grid-column-end: 2;
  grid-row-start: 2;
  grid-row-end: 3;
}
.east-table {
  grid-column-start: 3;
  grid-column-end: 4;
  grid-row-start: 2;
  grid-row-end: 3;
}
.south-table {
  grid-column-start: 2;
  grid-column-end: 3;
  grid-row-start: 3;
  grid-row-end: 4;
}
</style>
