const jwt = require('jsonwebtoken')
const loginRouter = require('express').Router()
const User = require('../model/user')
const bcrypt = require('bcrypt')

loginRouter.post('/', async (request, response) => {
  const body = request.body

  const user = await User.findOne({ username: body.username })

  const correctPassword = user === null ? false : await bcrypt.compare(body.password, user.passwordHash)

  if (!user || !correctPassword)
    response.status(401).json({
      error: 'invalid username or password'
    })

  const useForToken = {
    username: user.username,
    id: user._id
  }

  const token = jwt.sign(useForToken, process.env.SECRET)

  response.status(200).send({ token, username: user.username, name: user.name })
})

module.exports = loginRouter