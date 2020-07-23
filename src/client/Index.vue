<template>
  <div class="container">
    <h3>Lobby</h3>
    <div>
      <span>{{ playerCounts['/lobby'] || 0 }} 人在大廳閒晃</span>
    </div>

    <h3>Lan</h3>
    <div class="row">
      <div class="card-group col-sm-3 mb-3" v-for="game in lanGames">
        <div class="card">
          <div class="card-header">
            {{ game.title }}
          </div>
          <div class="card-body">
            <p class="card-text">
              {{ game.desc }}
            </p>
            <p>{{ playerCounts[game.href] || 0 }} playing</p>
            <a :href="game.href" class="card-link">Start</a>
          </div>
          <div class="card-footer">
            <p class="card-text">
              <small class="text-muted">{{ game.lastUpdate }}</small>
            </p>
          </div>
        </div>
      </div>
    </div>

    <h3>Single</h3>
    <div class="row">
      <div class="card-group col-sm-3 mb-3" v-for="game in SingleGames">
        <div class="card">
          <div class="card-header">
            {{ game.title }}
          </div>
          <div class="card-body">
            <p class="card-text">
              {{ game.desc }}
            </p>
            <a :href="game.href" class="card-link">Start</a>
          </div>
          <div class="card-footer">
            <p class="card-text">
              <small class="text-muted">{{ game.lastUpdate }}</small>
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import 'bootstrap/dist/css/bootstrap.min.css'
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

<style scoped></style>
