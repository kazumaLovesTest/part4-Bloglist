const blogRoute = require('express').Router()
const Blog = require('../model/blog')
const User = require('../model/user')

blogRoute.get('/', async (request, response) => {
  const blogs = await Blog.find({})
  response.json(blogs)
})

blogRoute.post('/', async (request, response) => {
  const body = request.body

  if (!body.url || !body.title)
    response.status(400).end()
  if (!body.likes)
    body.likes = 0

  const user = await User.findById(body.userId)
  const blog = new Blog({ ...body, user: user._id })
  const savedBlog = await blog.save()
  user.blogs = user.blogs.concat(savedBlog._id)
  await user.save()

  response.status(201).json(savedBlog)
})

blogRoute.delete('/:id', async (request, response) => {
  await Blog.findByIdAndRemove(request.params.id)
  response.status(204).end()
})

blogRoute.put('/:id', async (request, response) => {
  const id = request.params.id
  const body = request.body

  const updatedBlog = await Blog.findByIdAndUpdate(id, body, { new: true })
  console.log(updatedBlog)
  response.json(updatedBlog.toJSON())
})
module.exports = blogRoute