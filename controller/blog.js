const blogRoute = require('express').Router()
const Blog = require('../model/blog')

blogRoute.get('/', async (request, response) => {
  const blogs = await Blog.find({})
  response.json(blogs)
})

blogRoute.post('/', async (request, response) => {
  const blog = new Blog(request.body)
  if (!blog.url || !blog.title)
    response.status(400).end()
  if (!blog.likes)
    blog.likes = 0
  await blog.save()
  response.status(201).json(blog)
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