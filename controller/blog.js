const blogRouter = require('express').Router()
const Blog = require('../model/blog')
const middleware = require('../utils/middleware')


blogRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({}).populate('user', { blogs: 0, passwordHash: 0 })
  response.json(blogs)
})

blogRouter.post('/', middleware.userExtractor, async (request, response) => {
  const body = request.body

  if (!body.url || !body.title) {
    return response.status(400).end()
  }

  if (!body.likes)
    body.likes = 0

  const user = request.user
  const blog = new Blog({ ...body, user: user._id })
  const savedBlog = await blog.save()
  user.blogs = user.blogs.concat(savedBlog._id)
  await user.save()

  response.status(201).json(savedBlog)
})

blogRouter.delete('/:id', middleware.userExtractor, async (request, response) => {
  const id = request.params.id
  const blog = await Blog.findById(id)
  const user = request.user

  if (user.id.toString() !== blog.user.toString())
    return response.status(401).json({
      error: 'invalid authorization'
    })

  user.blogs = user.blogs.filter(_id => _id.toString() === blog._id.toString() ? false : true)
  await user.save()
  await Blog.findByIdAndRemove(request.params.id)
  response.status(204).end()
})

blogRouter.put('/:id', middleware.userExtractor, async (request, response) => {
  const id = request.params.id
  const body = request.body
  const blogIndb = await Blog.findById(body.id)
  const user = request.user

  if (user.id.toString() !== blogIndb.user.toString())
    return response.status(401).json({
      error: 'invalid authorization'
    }).end()

  const updatedBlog = await Blog.findByIdAndUpdate(id, body, { new: true })
  response.json(updatedBlog.toJSON())
})

module.exports = blogRouter