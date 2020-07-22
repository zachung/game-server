<template>
  <div class="container unselectable">
    <div class="wrapper">
      <hand
        :sit="2"
        :game="game"
        name="North Hand"
        @draw="draw"
        class="north-hand"
        :class="currentSit(2) ? 'current-sit' : ''"
      ></hand>
      <hand
        :sit="1"
        :game="game"
        name="West Hand"
        @draw="draw"
        class="west-hand"
        :class="currentSit(1) ? 'current-sit' : ''"
      ></hand>
      <desktop :table="game.table"></desktop>
      <hand
        :sit="3"
        :game="game"
        name="East Hand"
        @draw="draw"
        class="east-hand"
        :class="currentSit(3) ? 'current-sit' : ''"
      ></hand>
      <hand
        :sit="0"
        :game="game"
        name="South Hand"
        @draw="draw"
        class="south-hand"
        :class="currentSit(0) ? 'current-sit' : ''"
      ></hand>
      <dashboard :game="game" :message="message"></dashboard>
    </div>
  </div>
</template>
<script>
import Hand from './hand.vue'
import Desktop from './desktop.vue'
import Game from './js/Game'
import Dashboard from './dashboard.vue'

const game = new Game()
game.table.waitingSit(0)

export default {
  components: {
    Hand,
    Desktop,
    Dashboard
  },
  data: function() {
    return {
      game,
      message: "let's start"
    }
  },
  methods: {
    draw(sit, card) {
      this.game.putOnTable(sit, card).catch(err => {
        this.message = err.message
      })
    },
    currentSit(sit) {
      return sit === game.table.waitingSit()
    }
  },
  mounted() {
    game.distribute()
  }
}
</script>
<style scoped>
.container {
  font-family: monospace;
}
.wrapper {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  width: 75%;
}
.panel {
  width: 25%;
  position: absolute;
  box-sizing: border-box;
  top: 0;
  right: 0;
  border: 1px solid cadetblue;
  border-radius: 5px;
  padding: 5px;
  margin: 5px;
}
.north-hand {
  grid-column-start: 2;
  grid-column-end: 3;
}
.west-hand {
  grid-column-start: 1;
  grid-column-end: 2;
  grid-row-start: 2;
  grid-row-end: 3;
}
.east-hand {
  grid-column-start: 3;
  grid-column-end: 4;
  grid-row-start: 2;
  grid-row-end: 3;
}
.south-hand {
  grid-column-start: 2;
  grid-column-end: 3;
  grid-row-start: 3;
  grid-row-end: 4;
}
.table {
  grid-column-start: 2;
  grid-column-end: 3;
  grid-row-start: 2;
  grid-row-end: 3;
}
.current-sit {
  border: 1px solid red;
}
.unselectable {
  -moz-user-select: -moz-none;
  -khtml-user-select: none;
  -webkit-user-select: none;

  /*
           Introduced in IE 10.
           See http://ie.microsoft.com/testdrive/HTML5/msUserSelect/
         */
  -ms-user-select: none;
  user-select: none;
}
</style>
