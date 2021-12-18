const http = require('http')
const logger = require('./utils/logger')
const config = require('./utils/config')
const app = require('./app')

const server = http.createServer(app)

server.listen(config.PORT, () => {
  logger.info(`Listening on Port: ${config.PORT}`)
})