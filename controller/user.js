const userRouter = require('express').Router()
const bcrypt = require('bcrypt')
const User = require('../model/user')

userRouter.get('/', async (request, response) => {
  const users = await User.find({}).populate('blogs', { user: 0 })

  response.json(users)
})

userRouter.post('/', async (request, response) => {
  const body = request.body

  if (body.username.length < 3 || body.password.length < 8)
    response.status(400).json({
      error:'validation error. Too small'
    })

  const saltRound = 10
  const passwordHash = await bcrypt.hash(body.password, saltRound)

  const newUser = new User({ ...body, passwordHash, password: false })

  const savedUser = await newUser.save()
  response.status(201).json(savedUser)
})

userRouter.delete('/:id', async (request,response) => {
  await User.findByIdAndRemove(request.params.id)
  response.status(204).end()
})

module.exports = userRouter