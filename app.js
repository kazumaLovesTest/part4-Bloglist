require('express-async-errors')
const express = require('express')
const cors = require('cors')
const mongoose = require('mongoose')
const app = express()
const logger = require('./utils/logger')
const config = require('./utils/config')
const blogRoute = require('./controller/blog')
const userRoute = require('./controller/user')
const loginRoute = require('./controller/login')

app.use(express.json())

mongoose.connect(config.mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    logger.info('connection esablished with', config.mongoUrl)
  })
  .catch((error) => {
    logger.error('couldnt esablish connection because of', error)
  })
app.use(cors())
app.use(express.json())
app.use('/api/login',loginRoute)
app.use('/api/blogs',blogRoute)
app.use('/api/users',userRoute)
module.exports = app