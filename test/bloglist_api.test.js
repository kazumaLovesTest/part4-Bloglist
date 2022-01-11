const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const supertest = require('supertest')
const app = require('../app')
const Blog = require('../model/blog')
const User = require('../model/user')
const { getUsersInDb, getBlogsInDb, initialBlogs } = require('./bloglist_api_test_helper')
const api = supertest(app)

describe('when there is initially one user in the db', () => {
  beforeEach(async () => {
    await User.deleteMany({})

    const passwordHash = await bcrypt.hash('secret', 10)
    const user = new User({
      username: 'Kazuma',
      name: 'Mekbib',
      passwordHash
    })
    await user.save()
  }, 100000)

  test('the users are returned', async () => {
    const initialUsers = await getUsersInDb()

    const usersInDb = await api.get('/api/users')
      .expect(200)
      .expect('Content-Type', /application\/json/)

    expect(usersInDb.body).toHaveLength(initialUsers.length)
  })

  test('creation succedes with fresh new user', async () => {
    const initialUsers = await getUsersInDb()
    const user = {
      username: 'ThePower',
      name: 'Eleni',
      password: 'waterfdaf'
    }
    await api.post('/api/users')
      .send(user)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const usersInDb = await getUsersInDb()
    expect(usersInDb).toHaveLength(initialUsers.length + 1)

    const usernames = usersInDb.map(user => user.username)
    expect(usernames).toContain(user.username)
  })

  test('creation fails if username is taken with the appropriate status code', async () => {
    const initialUsers = await getUsersInDb()

    const userWithusernameTaken = {
      username: 'Kazuma',
      name: 'tarekegn',
      password: 'flower'
    }

    await api.post('/api/users')
      .send(userWithusernameTaken)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    const usersInDb = await getUsersInDb()
    expect(usersInDb).toHaveLength(initialUsers.length)
  })

  test('creation fails if username is short', async () => {
    const initialUsers = await getUsersInDb()
    const userWithShortusername = {
      username: 'ki',
      name: 'Eleni',
      password: 'flower'
    }
    await api.post('/api/users')
      .send(userWithShortusername)
      .expect(400)
      .expect('Content-Type', /application\/json/)
    const usersInDb = await getUsersInDb()
    expect(usersInDb).toHaveLength(initialUsers.length)
  })

  test('creation fails if passowrd is too small', async () => {
    const initialUsers = await getUsersInDb()
    const userWithShortPassword = {
      username: 'kilio',
      name: 'Eleni',
      password: 'flower'
    }
    await api.post('/api/users')
      .send(userWithShortPassword)
      .expect(400)
      .expect('Content-Type', /application\/json/)
    const usersInDb = await getUsersInDb()
    expect(usersInDb).toHaveLength(initialUsers.length)

  })
})
describe('When all blogs are initialised', () => {
  beforeEach(async () => {
    await Blog.deleteMany({})

    const blogObjects = initialBlogs.map(blog => new Blog(blog))
    const promiseArray = blogObjects.map(blog => blog.save())
    await Promise.all(promiseArray)
  }, 100000)

  describe('Getting', () => {
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
    let header
    beforeEach(async () => {
      await User.deleteMany({})

      const passwordHash = await bcrypt.hash('secret', 10)
      const user = new User({
        username: 'Kazuma',
        name: 'Mekbib',
        passwordHash
      })
      await user.save()
      const userToLogin = {
        username: 'Kazuma',
        password: 'secret'
      }

      const result = await api.post('/api/login')
        .send(userToLogin)
        .expect(200)
      header = { 'Authorization': `bearer ${result.body.token}` }
    }, 10000)
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
        .set(header)
        .expect(201)
      const blogsInDb = await getBlogsInDb()
      expect(blogsInDb).toHaveLength(initialBlogs.length + 1)
      const urlLists = blogsInDb.map(blog => blog.url)
      expect(urlLists).toContain(newBlog.url)
    }, 100000)

    test('if the like attribute is not given it wil default to zero', async () => {
      await api.post('/api/blogs')
        .send(blogWithNoLikes)
        .set(header)
        .expect(201)
      const blogsInDb = await getBlogsInDb()
      const blogAtEnd = blogsInDb[blogsInDb.length - 1]
      expect(blogAtEnd.likes).toBe(0)
    })

    test('if title or url are missing respond with a bad request', async () => {
      await api.post('/api/blogs')
        .send(blogWithNoUrl)
        .set(header)
        .expect(400)
      await api.post('/api/blogs')
        .send(blogWithNoTitle)
        .set(header)
        .expect(400)
    })
    describe('Deleting', () => {
      test('item is deleted', async () => {
        const blogsInDb = await getBlogsInDb()
        const itemToBeDeleted = blogsInDb[0]
        await api.delete(`/api/blogs/${itemToBeDeleted.id}`)
          .set(header)
          .expect(204)
      })
    })

    describe('Updating', () => {
      test('item is updated', async () => {
        const blogsInDb = await getBlogsInDb()
        const blogToBeUpdated = blogsInDb[0]
        blogToBeUpdated.likes = 0
        const blog = await api.put(`/api/blogs/${blogToBeUpdated.id}`)
          .send(blogToBeUpdated)
        expect(blog.body.likes).toBe(blogToBeUpdated.likes)
      })
    })
  })
})

describe('Logging', () => {

  beforeEach(async () => {
    await User.deleteMany({})
    const user = {
      username: 'ThePower',
      name: 'Eleni',
      password: 'waterfdaf'
    }
    await api.post('/api/users').send(user)
  }, 100000)
  test('succeds if username and password matches', async () => {
    const user = {
      username: 'ThePower',
      password: 'waterfdaf'
    }

    await api.post('/api/login')
      .send(user)
      .expect(200)
  }, 100000)

  test('fails if username and password dont match', async () => {
    const user = {
      username: 'ThePower',
      name: 'Eleni',
      password: 'water'
    }

    await api.post('/api/login')
      .send(user)
      .expect(401)
  })
})



afterAll(() => {
  mongoose.connection.close()
})
