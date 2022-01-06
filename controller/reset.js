const Blog = require('../model/blog')
const User = require('../model/user')
const resetRouter = require('express').Router()

resetRouter.delete('/reset', async(request,response) => {
  await Blog.deleteMany({})
  await User.deleteMany({})

  response.status(204).end()
})

module.exports = resetRouter