<template>
  <div class="container unselectable">
    <hand
      :sit="0"
      :game="game"
      name="North Hand"
      @draw="draw"
      :class="currentSit(0) ? 'current-sit' : ''"
    ></hand>
    <hand
      :sit="1"
      :game="game"
      name="West Hand"
      @draw="draw"
      :class="currentSit(1) ? 'current-sit' : ''"
    ></hand>
    <hand
      :sit="2"
      :game="game"
      name="East Hand"
      @draw="draw"
      :class="currentSit(2) ? 'current-sit' : ''"
    ></hand>
    <hand
      :sit="3"
      :game="game"
      name="South Hand"
      @draw="draw"
      :class="currentSit(3) ? 'current-sit' : ''"
    ></hand>
    <desktop :table="game.table"></desktop>
    <div class="panel">
      <div class="message">{{ message }}</div>
      <button @click="restart">Restart</button>
    </div>
  </div>
</template>
<script>
import Hand from './hand.vue'
import Desktop from './desktop.vue'
import Game from './js/Game'

const game = new Game()
game.table.waitingSit(0)

export default {
  components: {
    Hand,
    Desktop
  },
  data: function() {
    return {
      game,
      message: "let's start"
    }
  },
  methods: {
    restart() {
      game.distribute()
    },
    draw(sit, card) {
      this.game.table
        .put(sit, card)
        .then(() => {
          this.game.hand(sit).draw(card)
        })
        .catch(err => {
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
.current-sit {
  color: red;
}
.panel {
  border: 1px solid cadetblue;
  border-radius: 5px;
  padding: 5px;
  margin: 5px;
}
.message {
  color: red;
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
