const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const Blog = require('../model/blog')
const { getBlogsInDb, initialBlogs } = require('./bloglist_api_test_helper')
const api = supertest(app)

beforeEach(async () => {
  await Blog.deleteMany({})

  const blogObjects = initialBlogs.map(blog => new Blog(blog))
  const promiseArray = blogObjects.map(blog => blog.save())
  await Promise.all(promiseArray)
}, 100000)

describe('When all blogs are initialised', () => {
  test('blogs are returned as json', async () => {
    await api.get('/api/blogs')
      .expect(200)
      .expect('Content-type', /application\/json/)
  }, 100000)

  test('the correct amount of blogs are returned', async () => {
    const response = await api.get('/api/blogs')
    expect(response.body).toHaveLength(initialBlogs.length)
  }, 100000)
  test('unique identifier property of the blog posts is named id', async () => {
    const response = await api.get('/api/blogs')
    expect(response.body[0].id).toBeDefined()
  })
})

describe('when adding a new blog', () => {
  const newBlog = {
    title: 'Seth\'s Blog',
    author: 'seth',
    url: 'https://seths.blog/',
    likes: 5
  }
  const blogWithNoLikes = {
    title: 'Seth\'s Blog',
    author: 'seth',
    url: 'https://seths.blog/'
  }
  const blogWithNoTitle = {
    author: 'seth',
    url: 'https://seths.blog/',
    likes: 5
  }
  const blogWithNoUrl = {
    title: 'Seth\'s Blog',
    author: 'seth',
    likes: 5
  }
  test('blog is added to database', async () => {
    await api.post('/api/blogs')
      .send(newBlog)
      .expect(201)
    const blogsInDb = await getBlogsInDb()
    expect(blogsInDb).toHaveLength(initialBlogs.length + 1)
    const urlLists = blogsInDb.map(blog => blog.url)
    expect(urlLists).toContain(newBlog.url)
  }, 100000)
  test('if the like attribute is not given it wil default to zero', async () => {
    await api.post('/api/blogs')
      .send(blogWithNoLikes)
      .expect(201)
    const blogsInDb = await getBlogsInDb()
    const blogAtEnd = blogsInDb[blogsInDb.length - 1]
    expect(blogAtEnd.likes).toBe(0)
  })
  test('if title and url are missing respond with a bad request', async () => {
    await api.post('/api/blogs')
      .send(blogWithNoUrl)
      .expect(400)
    await api.post('/api/blogs')
      .send(blogWithNoTitle)
      .expect(400)
  })
})
describe('Deleting', () => {
  test('item is deleted', async () => {
    const blogsInDb = await getBlogsInDb()
    const itemToBeDeleted = blogsInDb[0]
    await api.delete(`/api/blogs/${itemToBeDeleted.id}`)
      .expect(204)
  })
})

describe('Updateing', () => {
  test('item is updated', async () => {
    const blogsInDb = await getBlogsInDb()
    const blogToBeUpdated = blogsInDb[0]
    blogToBeUpdated.likes = 0
    const blog = await api.put(`/api/blogs/${blogToBeUpdated.id}`)
      .send(blogToBeUpdated)
    expect(blog.body.likes).toBe(blogToBeUpdated.likes)
  })
})

afterAll(() => {
  mongoose.connection.close()
})
