<template>
  <div class="hand-container">
    <label>{{ name }}</label>
    <card
      v-for="card in hand.cards()"
      :key="card"
      :card="card"
      @click.native="draw(card)"
    ></card>
  </div>
</template>

<script>
import Card from './card.vue'

export default {
  components: {
    Card
  },
  props: {
    name: String,
    sit: Number,
    game: Object
  },
  computed: {
    hand() {
      return this.game.hand(this.sit)
    }
  },
  methods: {
    draw(card) {
      this.$emit('draw', this.sit, card)
    }
  }
}
</script>

<style scoped>
.hand-container {
  padding: 2px;
}
</style>
