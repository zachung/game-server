<template>
  <span class="card-in-hand" :class="suitStyle(suit)">
    <span>{{ Suits[suit] }}</span>
    {{ number }}
  </span>
</template>

<script>
import { CardNumbers, Suits } from './js/Constant'

export default {
  props: {
    card: Number
  },
  computed: {
    suit() {
      return Math.floor(this.card / 13)
    },
    number() {
      const number = this.card % 13
      return CardNumbers[number]
    }
  },
  data: function() {
    return {
      Suits
    }
  },
  methods: {
    suitStyle(suit) {
      const styleName = ['club', 'diamond', 'heart', 'spade']
      return 'suit-' + styleName[suit]
    }
  }
}
</script>

<style scoped>
.suit-heart {
  color: darkred;
}
.suit-diamond {
  color: red;
}
.suit-spade {
  color: black;
}
.suit-club {
  color: gray;
}
.card-in-hand {
  border: 1px solid green;
  border-radius: 5px;
  margin-right: 5px;
  padding: 0 5px;
  cursor: pointer;
}
</style>
