<template>
  <span class="card-in-hand" :class="suitStyle(suit)">
    <span>{{ this.suits[suit] }}</span>
    {{ number }}
  </span>
</template>

<script>
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
      return this.numbers[number]
    }
  },
  data: function() {
    return {
      suits: ['\u2663', '\u2666', '\u2665', '\u2660'],
      numbers: ['2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K', 'A']
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
