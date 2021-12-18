const http = require('http')
const express = require('express')
const cors = require('cors')
const mongoose = require('mongoose')
const app = express()
const logger = require('./utils/logger')
const config = require('./utils/config')
const Blog = require('./model/blog')
const blogRoute = require('./controller/blog')

mongoose.connect(config.mongoUrl)
  .then(() => {
    logger.info('connection esablished with', config.mongoUrl)
  })
  .catch((error) => {
    logger.error('couldnt esablish connection because of', error)
  })
app.use(cors())
app.use(express.json())
app.use('/api/blogs',blogRoute)
module.exports = app