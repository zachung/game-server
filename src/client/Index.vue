<template>
  <div>
    <h3>Engine</h3>
    <div>
      <span>{{ playerCounts['/lobby'] || 0 }} 人在大廳閒晃</span>
    </div>

    <h3>Lan</h3>
    <div class="section-container">
      <section v-for="game in lanGames">
        <div class="title">
          <a :href="game.href">{{ game.title }}</a>
          <span class="title-suffix">
            <span>{{ playerCounts[game.href] || 0 }} playing</span>
            <span class="last-update" v-if="game.lastUpdate">
              {{ game.lastUpdate }}
            </span>
          </span>
        </div>
        <p>{{ game.desc }}</p>
      </section>
    </div>

    <h3>Single</h3>
    <div class="section-container">
      <section v-for="game in SingleGames">
        <div class="title">
          <a :href="game.href">{{ game.title }}</a>
          <span class="title-suffix">
            <span class="last-update">{{ game.lastUpdate }}</span>
          </span>
        </div>
        <p>{{ game.desc }}</p>
      </section>
    </div>
  </div>
</template>

<script>
import io from 'socket.io-client'
import { LanGames, SingleGames } from './Games'

export default {
  data() {
    return {
      lanGames: LanGames,
      SingleGames: SingleGames,
      playerCounts: {}
    }
  },
  mounted() {
    const socket = io('/lobby')
    socket
      .on('user count', playerCounts => (this.playerCounts = playerCounts))
      .on('user leave', gameHref => this.playerCounts[gameHref]--)
  }
}
</script>

<style scoped>
.section-container {
  padding-left: 1em;
}
.last-update {
  font-style: italic;
  color: red;
}
.title-suffix {
  font-size: 0.3em;
}
div.title {
  font-size: 1.5em;
}
div.title a {
  text-decoration: none;
}
section p {
  border-left: 1px solid gray;
  margin-left: 1em;
  padding: 1em;
}
@keyframes mymove {
  from {
    margin-left: 10px;
  }
  to {
    margin-left: 20px;
  }
}
</style>
