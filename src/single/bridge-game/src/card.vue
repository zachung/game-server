<template>
  <span class="card-in-hand" :class="suitStyle(card.suit)">
    <span>{{ Suits[card.suit] }}</span>
    {{ CardNumbers[card.number] }}
  </span>
</template>

<script>
import { CardNumbers, Suits } from './js/Constant'

export default {
  props: {
    card: Object
  },
  data: function() {
    return {
      CardNumbers,
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
  display: inline-block;
  border: 1px solid green;
  border-radius: 5px;
  margin-right: 5px;
  padding: 0 5px;
  cursor: pointer;
}
</style>
