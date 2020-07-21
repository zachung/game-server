<template>
  <div class="hand-container">
    <div>
      <label>{{ name }}</label>
    </div>
    <div>
      <card v-for="card in spades" :key="card.code" :card="card" @click.native="draw(card)"></card>
    </div>
    <div>
      <card v-for="card in hearts" :key="card.code" :card="card" @click.native="draw(card)"></card>
    </div>
    <div>
      <card v-for="card in diamonds" :key="card.code" :card="card" @click.native="draw(card)"></card>
    </div>
    <div>
      <card v-for="card in clubs" :key="card.code" :card="card" @click.native="draw(card)"></card>
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
    name: String,
    sit: Number,
    game: Object
  },
  computed: {
    cards() {
      return this.game.hand(this.sit).cards()
    },
    spades() {
      return this.cards.filter(card => card.suit === 3)
    },
    hearts() {
      return this.cards.filter(card => card.suit === 2)
    },
    diamonds() {
      return this.cards.filter(card => card.suit === 1)
    },
    clubs() {
      return this.cards.filter(card => card.suit === 0)
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
