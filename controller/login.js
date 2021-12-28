const jwt = require('jsonwebtoken')
const loginRoute = require('express').Router()
const User = require('../model/user')
const bcrypt = require('bcrypt')

loginRoute.post('/', async (request, response) => {
  const body = request.body
  const user = await User.findOne({ userName: body.userName })

  const correctPassword = user === null ? false : await bcrypt.compare(body.password, user.passwordHash)

  console.log(correctPassword)
  if (!correctPassword)
    response.status(401).json({
      error: 'invalid username or password'
    })

  const useForToken = {
    userName: user.userName,
    id: user._id
  }

  const token = jwt.sign(useForToken, process.env.SECRET)

  response.status(200).send({ token, userName: user.userName, name: user.name })
})

module.exports = loginRoute