const userRoute = require('express').Router()
const bcrypt = require('bcrypt')
const User = require('../model/user')

userRoute.get('/', async (request, response) => {
  const users = await User.find({}).populate('blogs', { user: 0 })
  response.json(users)
})

userRoute.post('/', async (request, response) => {
  const body = request.body

  const saltRound = 10
  const passwordHash = await bcrypt.hash(body.password, saltRound)

  const newUser = new User({ ...body, passwordHash, password: false })

  const savedUser = await newUser.save()
  response.status(201).json(savedUser)
})


module.exports = userRoute