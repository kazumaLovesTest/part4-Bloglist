const blogRouter = require('express').Router()
const Blog = require('../model/blog')
const User = require('../model/user')
const jwt = require('jsonwebtoken')


blogRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({}).populate('user', { blogs: 0, passwordHash: 0 })
  response.json(blogs)
})

blogRouter.post('/', async (request, response) => {
  const body = request.body
  const decodedToken = jwt.verify(request.token, process.env.SECRET)
  if (!decodedToken.id)
    response.status(401).json({
      error: 'invalid token'
    })
  if (!body.url || !body.title)
    response.status(400).end()
  if (!body.likes)
    body.likes = 0

  const user = await User.findById(decodedToken.id)
  const blog = new Blog({ ...body, user: user._id })
  const savedBlog = await blog.save()
  user.blogs = user.blogs.concat(savedBlog._id)
  await user.save()

  response.status(201).json(savedBlog)
})

blogRouter.delete('/:id', async (request, response) => {
  const blog = await Blog.findById(request.params.id)
  const decodedToken = jwt.verify(request.token, process.env.SECRET)
  const userId = decodedToken.id

  if (userId.toString() !== blog.user.toString())
    response.status(401).json({
      error: 'invalid authorization'
    })
  await Blog.findByIdAndRemove(request.params.id)
  response.status(204).end()
})

blogRouter.delete('/', async (request, response) => {
  await Blog.deleteMany({})
  response.status(204).end()
})

blogRouter.put('/:id', async (request, response) => {
  const id = request.params.id
  const body = request.body

  const updatedBlog = await Blog.findByIdAndUpdate(id, body, { new: true })
  console.log(updatedBlog)
  response.json(updatedBlog.toJSON())
})
module.exports = blogRouter