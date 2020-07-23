const path = require('path')
const express = require('express')
const fs = require('fs')

module.exports = engine => {
  const router = express.Router()

  // routes
  const routes = './src/single/'
  fs.readdirSync(routes)
    .forEach(gameName =>
      router.use('/single/' + gameName, express.static(path.join(routes, gameName, 'public')))
    )

  // multi
  const lan = './src/lan/'
  fs.readdirSync(lan)
    .forEach(gameName => {
      const index = './lan/' + gameName + '/index'
      router.use('/' + gameName, require(index)(engine))
    })

  return router
}
