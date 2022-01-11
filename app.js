require('express-async-errors')
const express = require('express')
const cors = require('cors')
const mongoose = require('mongoose')
const app = express()
const logger = require('./utils/logger')
const config = require('./utils/config')
const blogRouter = require('./controller/blog')
const userRouter = require('./controller/user')
const loginRouter = require('./controller/login')
const middleware = require('./utils/middleware')

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
app.use(middleware.tokenExtractor)
app.use(express.static('build'))
app.use('/api/login', loginRouter)
app.use('/api/blogs', blogRouter)
app.use('/api/users', userRouter)

if (process.env.NODE_ENV === 'test') {
  const resetRouter = require('./controller/reset')
  app.use('/api/testing', resetRouter)
}

module.exports = app