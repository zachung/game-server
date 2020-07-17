<template>
  <div class="container unselectable">
    <hand :sit="0" :game="game" name="North Hand"></hand>
    <hand :sit="1" :game="game" name="West Hand"></hand>
    <hand :sit="2" :game="game" name="East Hand"></hand>
    <hand :sit="3" :game="game" name="South Hand"></hand>
    <desktop :table="game.table"></desktop>
  </div>
</template>
<script>
import Hand from './hand.vue'
import Desktop from './desktop.vue'
import Game from './game'

const game = new Game()
game.table.setTurn(0)

export default {
  components: {
    Hand,
    Desktop
  },
  data: function() {
    return {
      game
    }
  },
  mounted() {
    game.distribute()
  }
}
</script>
<style scoped>
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
